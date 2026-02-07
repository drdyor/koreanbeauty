from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from src.models.subscription import db, User
from src.models.dopamine_chart import (
    DopamineGoal, DopamineAchievement, GoalProgress, DopamineStats,
    GoalCategory, GoalStatus, AchievementType
)
from src.routes.subscription import token_required
from datetime import datetime, timedelta
import json

dopamine_bp = Blueprint('dopamine', __name__)

@dopamine_bp.route('/dopamine/dashboard', methods=['GET'])
@cross_origin()
@token_required
def get_dopamine_dashboard(current_user):
    """Get comprehensive dopamine chart dashboard data"""
    try:
        # Get or create user stats
        stats = DopamineStats.query.filter_by(user_id=current_user.id).first()
        if not stats:
            stats = DopamineStats(user_id=current_user.id)
            db.session.add(stats)
            db.session.commit()
        
        # Get active goals
        active_goals = DopamineGoal.query.filter_by(
            user_id=current_user.id,
            status=GoalStatus.ACTIVE
        ).order_by(DopamineGoal.importance_level.desc()).all()
        
        # Get recent achievements
        recent_achievements = DopamineAchievement.query.filter_by(
            user_id=current_user.id
        ).order_by(DopamineAchievement.achieved_at.desc()).limit(10).all()
        
        # Get completed goals this month
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        completed_this_month = DopamineGoal.query.filter(
            DopamineGoal.user_id == current_user.id,
            DopamineGoal.status == GoalStatus.COMPLETED,
            DopamineGoal.completed_date >= month_start
        ).count()
        
        # Calculate motivation trend (last 7 days of activity)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_progress = GoalProgress.query.join(DopamineGoal).filter(
            DopamineGoal.user_id == current_user.id,
            GoalProgress.created_at >= week_ago
        ).count()
        
        return jsonify({
            'stats': stats.to_dict(),
            'active_goals': [goal.to_dict() for goal in active_goals],
            'recent_achievements': [achievement.to_dict() for achievement in recent_achievements],
            'completed_this_month': completed_this_month,
            'weekly_activity': recent_progress,
            'motivation_trend': calculate_motivation_trend(current_user.id)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dopamine_bp.route('/dopamine/goals', methods=['GET'])
@cross_origin()
@token_required
def get_goals(current_user):
    """Get all user goals with optional filtering"""
    try:
        status_filter = request.args.get('status')
        category_filter = request.args.get('category')
        
        query = DopamineGoal.query.filter_by(user_id=current_user.id)
        
        if status_filter:
            query = query.filter_by(status=GoalStatus(status_filter))
        
        if category_filter:
            query = query.filter_by(category=GoalCategory(category_filter))
        
        goals = query.order_by(DopamineGoal.importance_level.desc()).all()
        
        return jsonify({
            'goals': [goal.to_dict() for goal in goals]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dopamine_bp.route('/dopamine/goals', methods=['POST'])
@cross_origin()
@token_required
def create_goal(current_user):
    """Create a new dopamine goal"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'target_value', 'category']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Parse target date if provided
        target_date = None
        if data.get('target_date'):
            target_date = datetime.fromisoformat(data['target_date'].replace('Z', '+00:00'))
        
        # Create new goal
        goal = DopamineGoal(
            user_id=current_user.id,
            title=data['title'],
            description=data.get('description', ''),
            category=GoalCategory(data['category']),
            target_value=float(data['target_value']),
            unit=data.get('unit', 'sessions'),
            target_date=target_date,
            reward_description=data.get('reward_description', ''),
            importance_level=int(data.get('importance_level', 5))
        )
        
        db.session.add(goal)
        db.session.commit()
        
        # Create achievement for goal creation
        achievement = DopamineAchievement(
            user_id=current_user.id,
            goal_id=goal.id,
            title="Goal Created",
            description=f"Created new goal: {goal.title}",
            achievement_type=AchievementType.MILESTONE,
            points_earned=10,
            badge_icon="🎯",
            badge_color="#2196F3"
        )
        db.session.add(achievement)
        
        # Update user stats
        stats = get_or_create_stats(current_user.id)
        stats.add_points(10)
        stats.total_achievements += 1
        
        db.session.commit()
        
        return jsonify({
            'message': 'Goal created successfully',
            'goal': goal.to_dict(),
            'achievement': achievement.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@dopamine_bp.route('/dopamine/goals/<int:goal_id>', methods=['PUT'])
@cross_origin()
@token_required
def update_goal(current_user, goal_id):
    """Update an existing goal"""
    try:
        goal = DopamineGoal.query.filter_by(
            id=goal_id,
            user_id=current_user.id
        ).first()
        
        if not goal:
            return jsonify({'error': 'Goal not found'}), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'title' in data:
            goal.title = data['title']
        if 'description' in data:
            goal.description = data['description']
        if 'target_value' in data:
            goal.target_value = float(data['target_value'])
        if 'unit' in data:
            goal.unit = data['unit']
        if 'target_date' in data:
            goal.target_date = datetime.fromisoformat(data['target_date'].replace('Z', '+00:00')) if data['target_date'] else None
        if 'reward_description' in data:
            goal.reward_description = data['reward_description']
        if 'importance_level' in data:
            goal.importance_level = int(data['importance_level'])
        if 'status' in data:
            goal.status = GoalStatus(data['status'])
        
        goal.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Goal updated successfully',
            'goal': goal.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@dopamine_bp.route('/dopamine/goals/<int:goal_id>/progress', methods=['POST'])
@cross_origin()
@token_required
def update_goal_progress(current_user, goal_id):
    """Update progress on a specific goal"""
    try:
        goal = DopamineGoal.query.filter_by(
            id=goal_id,
            user_id=current_user.id
        ).first()
        
        if not goal:
            return jsonify({'error': 'Goal not found'}), 404
        
        data = request.get_json()
        increment = float(data.get('increment', 1))
        note = data.get('note', '')
        
        # Update progress
        progress_entry = goal.update_progress(increment, note)
        
        # Calculate points based on progress
        points_earned = calculate_progress_points(increment, goal.importance_level)
        
        # Update user stats
        stats = get_or_create_stats(current_user.id)
        stats.add_points(points_earned)
        
        # Check for achievements
        achievements = check_for_achievements(goal, current_user.id)
        
        db.session.commit()
        
        response_data = {
            'message': 'Progress updated successfully',
            'goal': goal.to_dict(),
            'progress_entry': progress_entry.to_dict(),
            'points_earned': points_earned
        }
        
        if achievements:
            response_data['new_achievements'] = [achievement.to_dict() for achievement in achievements]
        
        return jsonify(response_data), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@dopamine_bp.route('/dopamine/goals/<int:goal_id>/complete', methods=['POST'])
@cross_origin()
@token_required
def complete_goal(current_user, goal_id):
    """Mark a goal as completed"""
    try:
        goal = DopamineGoal.query.filter_by(
            id=goal_id,
            user_id=current_user.id
        ).first()
        
        if not goal:
            return jsonify({'error': 'Goal not found'}), 404
        
        if goal.status == GoalStatus.COMPLETED:
            return jsonify({'error': 'Goal already completed'}), 400
        
        # Mark as completed
        goal.status = GoalStatus.COMPLETED
        goal.completed_date = datetime.utcnow()
        goal.current_value = goal.target_value
        
        # Create completion achievement
        achievement = DopamineAchievement(
            user_id=current_user.id,
            goal_id=goal.id,
            title="Goal Completed!",
            description=f"Completed goal: {goal.title}",
            achievement_type=AchievementType.COMPLETION,
            points_earned=goal.importance_level * 20,
            badge_icon="🏆",
            badge_color="#FFD700"
        )
        db.session.add(achievement)
        
        # Update user stats
        stats = get_or_create_stats(current_user.id)
        stats.add_points(goal.importance_level * 20)
        stats.total_achievements += 1
        stats.total_goals_completed += 1
        stats.update_streak(True)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Goal completed successfully',
            'goal': goal.to_dict(),
            'achievement': achievement.to_dict(),
            'points_earned': goal.importance_level * 20
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@dopamine_bp.route('/dopamine/achievements', methods=['GET'])
@cross_origin()
@token_required
def get_achievements(current_user):
    """Get user achievements"""
    try:
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        
        achievements = DopamineAchievement.query.filter_by(
            user_id=current_user.id
        ).order_by(DopamineAchievement.achieved_at.desc()).offset(offset).limit(limit).all()
        
        total_count = DopamineAchievement.query.filter_by(user_id=current_user.id).count()
        
        return jsonify({
            'achievements': [achievement.to_dict() for achievement in achievements],
            'total_count': total_count,
            'has_more': (offset + limit) < total_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dopamine_bp.route('/dopamine/stats', methods=['GET'])
@cross_origin()
@token_required
def get_stats(current_user):
    """Get detailed user statistics"""
    try:
        stats = get_or_create_stats(current_user.id)
        
        # Get additional analytics
        total_goals = DopamineGoal.query.filter_by(user_id=current_user.id).count()
        active_goals = DopamineGoal.query.filter_by(
            user_id=current_user.id,
            status=GoalStatus.ACTIVE
        ).count()
        
        # Calculate average completion time
        completed_goals = DopamineGoal.query.filter_by(
            user_id=current_user.id,
            status=GoalStatus.COMPLETED
        ).all()
        
        avg_completion_days = 0
        if completed_goals:
            total_days = sum([
                (goal.completed_date - goal.start_date).days
                for goal in completed_goals
                if goal.completed_date and goal.start_date
            ])
            avg_completion_days = total_days / len(completed_goals) if completed_goals else 0
        
        return jsonify({
            'stats': stats.to_dict(),
            'analytics': {
                'total_goals': total_goals,
                'active_goals': active_goals,
                'completion_rate': (stats.total_goals_completed / total_goals * 100) if total_goals > 0 else 0,
                'average_completion_days': round(avg_completion_days, 1)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Helper functions

def get_or_create_stats(user_id):
    """Get or create user stats"""
    stats = DopamineStats.query.filter_by(user_id=user_id).first()
    if not stats:
        stats = DopamineStats(user_id=user_id)
        db.session.add(stats)
    return stats

def calculate_progress_points(increment, importance_level):
    """Calculate points earned for progress"""
    base_points = max(1, int(increment))
    importance_multiplier = importance_level / 5  # Scale 1-10 to 0.2-2
    return int(base_points * importance_multiplier)

def calculate_motivation_trend(user_id):
    """Calculate 7-day motivation trend"""
    trends = []
    for i in range(7):
        day_start = datetime.utcnow() - timedelta(days=i+1)
        day_end = day_start + timedelta(days=1)
        
        daily_progress = GoalProgress.query.join(DopamineGoal).filter(
            DopamineGoal.user_id == user_id,
            GoalProgress.created_at >= day_start,
            GoalProgress.created_at < day_end
        ).count()
        
        trends.append({
            'date': day_start.strftime('%Y-%m-%d'),
            'activity_count': daily_progress
        })
    
    return list(reversed(trends))

def check_for_achievements(goal, user_id):
    """Check for new achievements based on goal progress"""
    achievements = []
    
    # Milestone achievements (25%, 50%, 75%, 100%)
    progress_percentage = goal.progress_percentage
    milestones = [25, 50, 75]
    
    for milestone in milestones:
        if progress_percentage >= milestone:
            # Check if this milestone achievement already exists
            existing = DopamineAchievement.query.filter_by(
                user_id=user_id,
                goal_id=goal.id,
                title=f"{milestone}% Progress"
            ).first()
            
            if not existing:
                achievement = DopamineAchievement(
                    user_id=user_id,
                    goal_id=goal.id,
                    title=f"{milestone}% Progress",
                    description=f"Reached {milestone}% progress on {goal.title}",
                    achievement_type=AchievementType.MILESTONE,
                    points_earned=milestone // 5,  # 5, 10, 15 points
                    badge_icon="📈",
                    badge_color="#FF9800"
                )
                db.session.add(achievement)
                achievements.append(achievement)
    
    return achievements

