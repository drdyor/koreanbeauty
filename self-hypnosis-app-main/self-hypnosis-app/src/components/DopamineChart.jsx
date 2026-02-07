import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import './DopamineChart.css';

const DopamineChart = ({ user, authToken }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'therapeutic',
    target_value: 1,
    unit: 'sessions',
    target_date: '',
    reward_description: '',
    importance_level: 5
  });

  const API_BASE = '/api';

  const goalCategories = [
    { value: 'therapeutic', label: 'Therapeutic', icon: '🧠', color: '#4CAF50' },
    { value: 'personal', label: 'Personal', icon: '🌟', color: '#2196F3' },
    { value: 'health', label: 'Health', icon: '💪', color: '#FF5722' },
    { value: 'learning', label: 'Learning', icon: '📚', color: '#9C27B0' },
    { value: 'social', label: 'Social', icon: '👥', color: '#FF9800' },
    { value: 'creative', label: 'Creative', icon: '🎨', color: '#E91E63' },
    { value: 'professional', label: 'Professional', icon: '💼', color: '#607D8B' }
  ];

  useEffect(() => {
    if (authToken) {
      fetchDashboardData();
      fetchGoals();
      fetchAchievements();
    }
  }, [authToken]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE}/dopamine/dashboard`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await fetch(`${API_BASE}/dopamine/goals`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await fetch(`${API_BASE}/dopamine/achievements?limit=10`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const createGoal = async () => {
    try {
      const response = await fetch(`${API_BASE}/dopamine/goals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newGoal)
      });
      
      if (response.ok) {
        const data = await response.json();
        setGoals([...goals, data.goal]);
        setShowGoalForm(false);
        setNewGoal({
          title: '',
          description: '',
          category: 'therapeutic',
          target_value: 1,
          unit: 'sessions',
          target_date: '',
          reward_description: '',
          importance_level: 5
        });
        fetchDashboardData(); // Refresh dashboard
        
        // Show achievement notification
        if (data.achievement) {
          showAchievementNotification(data.achievement);
        }
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const updateGoalProgress = async (goalId, increment, note = '') => {
    try {
      const response = await fetch(`${API_BASE}/dopamine/goals/${goalId}/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ increment, note })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update goals list
        setGoals(goals.map(goal => 
          goal.id === goalId ? data.goal : goal
        ));
        
        fetchDashboardData(); // Refresh dashboard
        
        // Show achievement notifications
        if (data.new_achievements) {
          data.new_achievements.forEach(achievement => {
            showAchievementNotification(achievement);
          });
        }
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  const completeGoal = async (goalId) => {
    try {
      const response = await fetch(`${API_BASE}/dopamine/goals/${goalId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update goals list
        setGoals(goals.map(goal => 
          goal.id === goalId ? data.goal : goal
        ));
        
        fetchDashboardData(); // Refresh dashboard
        showAchievementNotification(data.achievement);
      }
    } catch (error) {
      console.error('Error completing goal:', error);
    }
  };

  const showAchievementNotification = (achievement) => {
    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-content">
        <span class="achievement-icon">${achievement.badge_icon}</span>
        <div class="achievement-text">
          <h4>${achievement.title}</h4>
          <p>+${achievement.points_earned} points</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  const getCategoryInfo = (category) => {
    return goalCategories.find(cat => cat.value === category) || goalCategories[0];
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#4CAF50';
    if (percentage >= 75) return '#8BC34A';
    if (percentage >= 50) return '#FFC107';
    if (percentage >= 25) return '#FF9800';
    return '#F44336';
  };

  if (loading) {
    return (
      <div className="dopamine-chart-loading">
        <div className="loading-spinner"></div>
        <p>Loading your progress...</p>
      </div>
    );
  }

  return (
    <div className="dopamine-chart">
      <div className="dopamine-header">
        <h2>🎯 Achievement Dashboard</h2>
        <p>Track your progress and celebrate your wins!</p>
      </div>

      {/* Stats Overview */}
      {dashboardData && (
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <h3>{dashboardData.stats.total_points}</h3>
              <p>Total Points</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎖️</div>
            <div className="stat-content">
              <h3>{dashboardData.stats.total_achievements}</h3>
              <p>Achievements</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{dashboardData.stats.total_goals_completed}</h3>
              <p>Goals Completed</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <h3>{dashboardData.stats.current_streak}</h3>
              <p>Current Streak</p>
            </div>
          </div>
        </div>
      )}

      {/* Motivation Trend Chart */}
      {dashboardData && dashboardData.motivation_trend && (
        <div className="chart-section">
          <h3>📈 Weekly Activity Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dashboardData.motivation_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="activity_count" 
                stroke="#4CAF50" 
                strokeWidth={3}
                dot={{ fill: '#4CAF50', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Active Goals */}
      <div className="goals-section">
        <div className="section-header">
          <h3>🎯 Active Goals</h3>
          <button 
            className="add-goal-btn"
            onClick={() => setShowGoalForm(true)}
          >
            + Add Goal
          </button>
        </div>

        <div className="goals-grid">
          {goals.filter(goal => goal.status === 'active').map(goal => {
            const categoryInfo = getCategoryInfo(goal.category);
            const progressColor = getProgressColor(goal.progress_percentage);
            
            return (
              <div key={goal.id} className="goal-card">
                <div className="goal-header">
                  <span className="goal-category-icon">{categoryInfo.icon}</span>
                  <div className="goal-title-section">
                    <h4>{goal.title}</h4>
                    <span className="goal-category">{categoryInfo.label}</span>
                  </div>
                  <div className="goal-importance">
                    {'⭐'.repeat(Math.min(goal.importance_level, 5))}
                  </div>
                </div>
                
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${goal.progress_percentage}%`,
                        backgroundColor: progressColor
                      }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {goal.current_value} / {goal.target_value} {goal.unit}
                    <span className="progress-percentage">
                      ({Math.round(goal.progress_percentage)}%)
                    </span>
                  </div>
                </div>

                {goal.target_date && (
                  <div className="goal-deadline">
                    <span className={goal.is_overdue ? 'overdue' : ''}>
                      {goal.is_overdue ? '⚠️ Overdue' : `📅 ${goal.days_remaining} days left`}
                    </span>
                  </div>
                )}

                <div className="goal-actions">
                  <button 
                    className="progress-btn"
                    onClick={() => updateGoalProgress(goal.id, 1)}
                  >
                    +1 Progress
                  </button>
                  
                  {goal.progress_percentage >= 100 && (
                    <button 
                      className="complete-btn"
                      onClick={() => completeGoal(goal.id)}
                    >
                      🏆 Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="achievements-section">
        <h3>🏆 Recent Achievements</h3>
        <div className="achievements-list">
          {achievements.slice(0, 5).map(achievement => (
            <div key={achievement.id} className="achievement-item">
              <span 
                className="achievement-badge"
                style={{ backgroundColor: achievement.badge_color }}
              >
                {achievement.badge_icon}
              </span>
              <div className="achievement-details">
                <h4>{achievement.title}</h4>
                <p>{achievement.description}</p>
                <span className="achievement-points">+{achievement.points_earned} points</span>
              </div>
              <div className="achievement-date">
                {new Date(achievement.achieved_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goal Creation Form Modal */}
      {showGoalForm && (
        <div className="modal-overlay">
          <div className="goal-form-modal">
            <div className="modal-header">
              <h3>🎯 Create New Goal</h3>
              <button 
                className="close-btn"
                onClick={() => setShowGoalForm(false)}
              >
                ×
              </button>
            </div>
            
            <div className="goal-form">
              <div className="form-group">
                <label>Goal Title *</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  placeholder="e.g., Complete 10 fear pattern sessions"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  placeholder="Describe your goal and why it's important to you..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                  >
                    {goalCategories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Target Value *</label>
                  <input
                    type="number"
                    min="1"
                    value={newGoal.target_value}
                    onChange={(e) => setNewGoal({...newGoal, target_value: parseInt(e.target.value)})}
                  />
                </div>

                <div className="form-group">
                  <label>Unit</label>
                  <input
                    type="text"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                    placeholder="sessions, days, hours..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Target Date</label>
                  <input
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Importance Level (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newGoal.importance_level}
                    onChange={(e) => setNewGoal({...newGoal, importance_level: parseInt(e.target.value)})}
                  />
                  <span className="range-value">{newGoal.importance_level}</span>
                </div>
              </div>

              <div className="form-group">
                <label>Reward Description</label>
                <input
                  type="text"
                  value={newGoal.reward_description}
                  onChange={(e) => setNewGoal({...newGoal, reward_description: e.target.value})}
                  placeholder="How will you celebrate achieving this goal?"
                />
              </div>

              <div className="form-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowGoalForm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="create-btn"
                  onClick={createGoal}
                  disabled={!newGoal.title || !newGoal.target_value}
                >
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DopamineChart;

