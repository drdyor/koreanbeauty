import React, { useState, useEffect } from 'react';
import deepLinkHandler from '../services/deepLinkHandler.js';
import dataSyncService from '../services/dataSyncService.js';

const MomentumFlowIntegration = () => {
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSync, setLastSync] = useState(null);
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Set up sync listeners
    dataSyncService.addSyncListener('sync:completed', (result) => {
      setSyncStatus('completed');
      setLastSync(result.syncedAt);
      setIsPremium(result.isPremium);
    });

    dataSyncService.addSyncListener('sync:failed', () => {
      setSyncStatus('failed');
    });

    dataSyncService.addSyncListener('habit:updated', () => {
      loadHabits();
    });

    dataSyncService.addSyncListener('task:created', () => {
      loadTasks();
    });

    // Load initial data
    loadData();

    return () => {
      // Cleanup listeners would go here if needed
    };
  }, []);

  const loadData = async () => {
    try {
      setSyncStatus('loading');
      await loadHabits();
      await loadTasks();
      const premiumStatus = await dataSyncService.getPremiumStatus();
      setIsPremium(premiumStatus);
      setSyncStatus('idle');
    } catch (error) {
      console.error('Failed to load data:', error);
      setSyncStatus('failed');
    }
  };

  const loadHabits = async () => {
    try {
      const habitsData = await dataSyncService.syncHabits();
      setHabits(habitsData.filter(h => h.source === 'momentumflow').slice(0, 5)); // Show first 5
    } catch (error) {
      console.error('Failed to load habits:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const tasksData = await dataSyncService.syncTasks();
      setTasks(tasksData.filter(t => t.source === 'momentumflow').slice(0, 5)); // Show first 5
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const handleSync = async () => {
    try {
      setSyncStatus('syncing');
      await dataSyncService.syncWithMomentumFlow(true);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('failed');
    }
  };

  const openMomentumFlow = (action = 'open', params = {}) => {
    deepLinkHandler.openMomentumFlow(action, params);
  };

  const createTherapeuticHabit = async () => {
    try {
      const habitData = {
        name: 'Daily Meditation Practice',
        notes: 'Therapeutic habit created from Self-Hypnosis app',
        category: 'therapy'
      };
      
      await dataSyncService.createTherapeuticHabit(habitData);
      
      // Open MomentumFlow to show the new habit
      openMomentumFlow('habit/view', { category: 'therapy' });
      
      // Reload habits
      loadHabits();
    } catch (error) {
      console.error('Failed to create therapeutic habit:', error);
    }
  };

  const createTherapeuticTask = async () => {
    try {
      const taskData = {
        name: 'Complete CBT Exercise',
        notes: 'Therapeutic task created from Self-Hypnosis app',
        type: 'therapeutic',
        priority: 'high',
        due: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      };
      
      await dataSyncService.createTherapeuticTask(taskData);
      
      // Open MomentumFlow to show the new task
      openMomentumFlow('task/view', { type: 'therapeutic' });
      
      // Reload tasks
      loadTasks();
    } catch (error) {
      console.error('Failed to create therapeutic task:', error);
    }
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'syncing': case 'loading': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'completed': return 'Synced';
      case 'failed': return 'Sync Failed';
      case 'syncing': return 'Syncing...';
      case 'loading': return 'Loading...';
      default: return 'Ready';
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">MomentumFlow Integration</h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${getSyncStatusColor()}`}>
            {getSyncStatusText()}
          </span>
          {isPremium && (
            <span className="bg-gradient-to-r from-gold-400 to-gold-600 text-white text-xs px-2 py-1 rounded">
              Premium
            </span>
          )}
        </div>
      </div>

      {lastSync && (
        <p className="text-sm text-muted-foreground mb-4">
          Last synced: {lastSync.toLocaleString()}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Habits Section */}
        <div className="space-y-2">
          <h4 className="font-medium text-foreground">Recent Habits</h4>
          {habits.length > 0 ? (
            <div className="space-y-2">
              {habits.map((habit, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                  <span className="text-sm">{habit.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {habit.streak} day streak
                    </span>
                    {habit.completed && (
                      <span className="text-green-600 text-xs">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No habits synced</p>
          )}
        </div>

        {/* Tasks Section */}
        <div className="space-y-2">
          <h4 className="font-medium text-foreground">Recent Tasks</h4>
          {tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                  <span className="text-sm">{task.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {task.priority}
                    </span>
                    {task.completed && (
                      <span className="text-green-600 text-xs">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No tasks synced</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={handleSync}
          disabled={syncStatus === 'syncing' || syncStatus === 'loading'}
          className="px-3 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
        </button>
        
        <button
          onClick={() => openMomentumFlow('open')}
          className="px-3 py-2 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/90"
        >
          Open MomentumFlow
        </button>
        
        <button
          onClick={createTherapeuticHabit}
          className="px-3 py-2 bg-therapeutic-primary text-white rounded text-sm hover:bg-therapeutic-primary/90"
        >
          Create Habit
        </button>
        
        <button
          onClick={createTherapeuticTask}
          className="px-3 py-2 bg-therapeutic-secondary text-white rounded text-sm hover:bg-therapeutic-secondary/90"
        >
          Create Task
        </button>
      </div>

      {/* Quick Actions */}
      <div className="border-t pt-4">
        <h4 className="font-medium text-foreground mb-2">Quick Actions</h4>
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            onClick={() => openMomentumFlow('habit/create', { name: 'Meditation', category: 'therapy' })}
            className="text-primary hover:underline"
          >
            Add Meditation Habit
          </button>
          <span className="text-muted-foreground">•</span>
          <button
            onClick={() => openMomentumFlow('task/create', { name: 'Journal Entry', type: 'therapeutic' })}
            className="text-primary hover:underline"
          >
            Add Journal Task
          </button>
          <span className="text-muted-foreground">•</span>
          <button
            onClick={() => openMomentumFlow('progress/view')}
            className="text-primary hover:underline"
          >
            View Progress
          </button>
        </div>
      </div>

      {syncStatus === 'failed' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          Sync failed. Please check your connection and try again.
        </div>
      )}
    </div>
  );
};

export default MomentumFlowIntegration;

