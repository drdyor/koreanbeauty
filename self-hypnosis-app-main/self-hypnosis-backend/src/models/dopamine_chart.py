from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import enum
from .subscription import db

class GoalCategory(enum.Enum):
    THERAPEUTIC = "therapeutic"
    PERSONAL = "personal"
    HEALTH = "health"
    LEARNING = "learning"
    SOCIAL = "social"
    CREATIVE = "creative"
    PROFESSIONAL = "professional"

class GoalStatus(enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"
    ARCHIVED = "archived"

class AchievementType(enum.Enum):
    MILESTONE = "milestone"
    STREAK = "streak"
    COMPLETION = "completion"
    PROGRESS = "progress"

class DopamineGoal(db.Model):
    """Model for user-defined achievement goals"""
    __tablename__ = 'dopamine_goals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Goal details
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.Enum(GoalCategory), nullable=False, default=GoalCategory.THERAPEUTIC)
    status = db.Column(db.Enum(GoalStatus), nullable=False, default=GoalStatus.ACTIVE)
    
    # Progress tracking
    target_value = db.Column(db.Float, nullable=False)  # Target number (sessions, days, etc.)
    current_value = db.Column(db.Float, default=0.0)    # Current progress
    unit = db.Column(db.String(50), default="sessions") # Unit of measurement
    
    # Timing
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    target_date = db.Column(db.DateTime)
    completed_date = db.Column(db.DateTime)
    
    # Motivation
    reward_description = db.Column(db.String(500))
    importance_level = db.Column(db.Integer, default=5)  # 1-10 scale
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    achievements = db.relationship('DopamineAchievement', backref='goal', lazy=True, cascade='all, delete-orphan')
    progress_entries = db.relationship('GoalProgress', backref='goal', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'category': self.category.value,
            'status': self.status.value,
            'target_value': self.target_value,
            'current_value': self.current_value,
            'unit': self.unit,
            'progress_percentage': self.progress_percentage,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'target_date': self.target_date.isoformat() if self.target_date else None,
            'completed_date': self.completed_date.isoformat() if self.completed_date else None,
            'reward_description': self.reward_description,
            'importance_level': self.importance_level,
            'days_remaining': self.days_remaining,
            'is_overdue': self.is_overdue,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    @property
    def progress_percentage(self):
        """Calculate progress as percentage"""
        if self.target_value <= 0:
            return 0
        return min(100, (self.current_value / self.target_value) * 100)
    
    @property
    def days_remaining(self):
        """Calculate days remaining until target date"""
        if not self.target_date:
            return None
        delta = self.target_date - datetime.utcnow()
        return max(0, delta.days)
    
    @property
    def is_overdue(self):
        """Check if goal is overdue"""
        if not self.target_date or self.status == GoalStatus.COMPLETED:
            return False
        return datetime.utcnow() > self.target_date
    
    def update_progress(self, value_increment, note=None):
        """Update goal progress and create progress entry"""
        old_value = self.current_value
        self.current_value += value_increment
        self.updated_at = datetime.utcnow()
        
        # Check if goal is completed
        if self.current_value >= self.target_value and self.status == GoalStatus.ACTIVE:
            self.status = GoalStatus.COMPLETED
            self.completed_date = datetime.utcnow()
        
        # Create progress entry
        progress_entry = GoalProgress(
            goal_id=self.id,
            previous_value=old_value,
            new_value=self.current_value,
            increment=value_increment,
            note=note
        )
        db.session.add(progress_entry)
        
        return progress_entry

class DopamineAchievement(db.Model):
    """Model for tracking achievements and milestones"""
    __tablename__ = 'dopamine_achievements'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    goal_id = db.Column(db.Integer, db.ForeignKey('dopamine_goals.id'), nullable=True)
    
    # Achievement details
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    achievement_type = db.Column(db.Enum(AchievementType), nullable=False)
    
    # Points and rewards
    points_earned = db.Column(db.Integer, default=0)
    badge_icon = db.Column(db.String(100))  # Icon name or emoji
    badge_color = db.Column(db.String(20), default="#4CAF50")
    
    # Metadata
    achieved_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'goal_id': self.goal_id,
            'title': self.title,
            'description': self.description,
            'achievement_type': self.achievement_type.value,
            'points_earned': self.points_earned,
            'badge_icon': self.badge_icon,
            'badge_color': self.badge_color,
            'achieved_at': self.achieved_at.isoformat(),
            'created_at': self.created_at.isoformat()
        }

class GoalProgress(db.Model):
    """Model for tracking individual progress updates"""
    __tablename__ = 'goal_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('dopamine_goals.id'), nullable=False)
    
    # Progress data
    previous_value = db.Column(db.Float, nullable=False)
    new_value = db.Column(db.Float, nullable=False)
    increment = db.Column(db.Float, nullable=False)
    note = db.Column(db.Text)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'goal_id': self.goal_id,
            'previous_value': self.previous_value,
            'new_value': self.new_value,
            'increment': self.increment,
            'note': self.note,
            'created_at': self.created_at.isoformat()
        }

class DopamineStats(db.Model):
    """Model for user dopamine/motivation statistics"""
    __tablename__ = 'dopamine_stats'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    
    # Overall stats
    total_points = db.Column(db.Integer, default=0)
    total_achievements = db.Column(db.Integer, default=0)
    total_goals_completed = db.Column(db.Integer, default=0)
    current_streak = db.Column(db.Integer, default=0)
    longest_streak = db.Column(db.Integer, default=0)
    
    # Weekly/Monthly stats
    weekly_points = db.Column(db.Integer, default=0)
    monthly_points = db.Column(db.Integer, default=0)
    last_activity_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Motivation level (1-10)
    current_motivation_level = db.Column(db.Integer, default=5)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'total_points': self.total_points,
            'total_achievements': self.total_achievements,
            'total_goals_completed': self.total_goals_completed,
            'current_streak': self.current_streak,
            'longest_streak': self.longest_streak,
            'weekly_points': self.weekly_points,
            'monthly_points': self.monthly_points,
            'current_motivation_level': self.current_motivation_level,
            'last_activity_date': self.last_activity_date.isoformat() if self.last_activity_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def add_points(self, points):
        """Add points and update stats"""
        self.total_points += points
        self.weekly_points += points
        self.monthly_points += points
        self.last_activity_date = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def update_streak(self, increment=True):
        """Update streak counter"""
        if increment:
            self.current_streak += 1
            if self.current_streak > self.longest_streak:
                self.longest_streak = self.current_streak
        else:
            self.current_streak = 0
        self.updated_at = datetime.utcnow()
    
    def reset_weekly_stats(self):
        """Reset weekly statistics"""
        self.weekly_points = 0
        self.updated_at = datetime.utcnow()
    
    def reset_monthly_stats(self):
        """Reset monthly statistics"""
        self.monthly_points = 0
        self.updated_at = datetime.utcnow()

