// Data Synchronization Service for Self-Hypnosis Behavioral Rewiring App
// Handles data sync with MomentumFlow via Firestore

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

class DataSyncService {
  constructor() {
    this.app = null;
    this.db = null;
    this.auth = null;
    this.currentUser = null;
    this.isInitialized = false;
    this.syncListeners = new Map();
    this.encryptionKey = null;
  }

  // Initialize Firebase and authentication
  async initialize() {
    if (this.isInitialized) return;

    try {
      this.app = initializeApp(firebaseConfig);
      this.db = getFirestore(this.app);
      this.auth = getAuth(this.app);

      // Listen for auth state changes
      onAuthStateChanged(this.auth, (user) => {
        this.currentUser = user;
        if (user) {
          this.loadEncryptionKey();
        }
      });

      this.isInitialized = true;
      console.log('DataSyncService initialized');
    } catch (error) {
      console.error('Failed to initialize DataSyncService:', error);
      throw error;
    }
  }

  // Load encryption key from secure storage
  async loadEncryptionKey() {
    try {
      // In a real implementation, this would be derived from user authentication
      // For now, we'll use a placeholder that matches MomentumFlow's approach
      this.encryptionKey = 'your-secure-key-32bytes-long!!';
    } catch (error) {
      console.error('Failed to load encryption key:', error);
    }
  }

  // Encrypt data (compatible with MomentumFlow's encryption)
  async encrypt(text) {
    if (!text || !this.encryptionKey) return text;
    
    try {
      // Import crypto utilities
      const { encrypt } = await import('../utils/encryption.js');
      return encrypt(text, this.encryptionKey);
    } catch (error) {
      console.error('Encryption failed:', error);
      return text; // Fallback to plain text
    }
  }

  // Decrypt data (compatible with MomentumFlow's decryption)
  async decrypt(encryptedText) {
    if (!encryptedText || !this.encryptionKey) return encryptedText;
    
    try {
      // Import crypto utilities
      const { decrypt } = await import('../utils/encryption.js');
      return decrypt(encryptedText, this.encryptionKey);
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedText; // Fallback to encrypted text
    }
  }

  // Get current user ID
  getCurrentUserId() {
    return this.currentUser?.uid || null;
  }

  // Sync habit data with MomentumFlow
  async syncHabits() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const habitsRef = collection(this.db, 'habits');
      const q = query(habitsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      const habits = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const habit = {
          id: data.id,
          name: await this.decrypt(data.name),
          streak: data.streak,
          completed: data.completed,
          weeklyRate: data.weeklyRate,
          encryptedNotes: data.encryptedNotes,
          isProtected: data.isProtected || false,
          protectionUsed: data.protectionUsed || 0,
          lastProtectionDate: data.lastProtectionDate?.toDate() || null,
          lastUpdated: data.lastUpdated?.toDate() || null,
          source: data.source || 'momentumflow'
        };
        habits.push(habit);
      }

      return habits;
    } catch (error) {
      console.error('Failed to sync habits:', error);
      throw error;
    }
  }

  // Sync task data with MomentumFlow
  async syncTasks() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const tasksRef = collection(this.db, 'tasks');
      const q = query(tasksRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      const tasks = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const task = {
          id: data.id,
          name: await this.decrypt(data.name),
          due: data.due?.toDate() || null,
          priority: data.priority,
          completed: data.completed,
          dependsOn: data.dependsOn || [],
          encryptedNotes: data.encryptedNotes,
          attachmentUrls: data.attachmentUrls || [],
          lastUpdated: data.lastUpdated?.toDate() || null,
          source: data.source || 'momentumflow'
        };
        tasks.push(task);
      }

      return tasks;
    } catch (error) {
      console.error('Failed to sync tasks:', error);
      throw error;
    }
  }

  // Update habit status (called from deep link handler)
  async updateHabitStatus(habitId, completed, source = 'selfhypnosis') {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const habitDocRef = doc(this.db, 'habits', `${userId}_${habitId}`);
      const habitDoc = await getDoc(habitDocRef);

      if (!habitDoc.exists()) {
        throw new Error('Habit not found');
      }

      const habitData = habitDoc.data();
      const updatedData = {
        completed,
        lastUpdated: serverTimestamp(),
        source
      };

      // Update streak logic
      if (completed && !habitData.isProtected) {
        updatedData.streak = (habitData.streak || 0) + 1;
      } else if (!completed && !habitData.isProtected) {
        updatedData.streak = 0;
      }

      // Reset protection after use
      if (habitData.isProtected) {
        updatedData.isProtected = false;
      }

      await updateDoc(habitDocRef, updatedData);
      
      // Notify listeners
      this.notifySyncListeners('habit:updated', { habitId, completed, source });
      
      return true;
    } catch (error) {
      console.error('Failed to update habit status:', error);
      throw error;
    }
  }

  // Create therapeutic habit (called from self-hypnosis app)
  async createTherapeuticHabit(habitData) {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const habitId = Date.now(); // Simple ID generation
      const encryptedName = await this.encrypt(habitData.name);
      const encryptedNotes = habitData.notes ? await this.encrypt(habitData.notes) : null;

      const habit = {
        userId,
        id: habitId,
        name: encryptedName,
        streak: 0,
        completed: false,
        weeklyRate: 0,
        encryptedNotes,
        isProtected: false,
        protectionUsed: 0,
        lastProtectionDate: null,
        category: 'therapy',
        source: 'selfhypnosis',
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };

      const habitDocRef = doc(this.db, 'habits', `${userId}_${habitId}`);
      await setDoc(habitDocRef, habit);

      // Notify listeners
      this.notifySyncListeners('habit:created', { habitId, source: 'selfhypnosis' });

      return habitId;
    } catch (error) {
      console.error('Failed to create therapeutic habit:', error);
      throw error;
    }
  }

  // Create therapeutic task (called from self-hypnosis app)
  async createTherapeuticTask(taskData) {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const taskId = Date.now(); // Simple ID generation
      const encryptedName = await this.encrypt(taskData.name);
      const encryptedNotes = taskData.notes ? await this.encrypt(taskData.notes) : null;

      const task = {
        userId,
        id: taskId,
        name: encryptedName,
        due: taskData.due || null,
        priority: taskData.priority || 'medium',
        completed: false,
        dependsOn: taskData.dependsOn || [],
        encryptedNotes,
        attachmentUrls: [],
        type: 'therapeutic',
        source: 'selfhypnosis',
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };

      const taskDocRef = doc(this.db, 'tasks', `${userId}_${taskId}`);
      await setDoc(taskDocRef, task);

      // Notify listeners
      this.notifySyncListeners('task:created', { taskId, source: 'selfhypnosis' });

      return taskId;
    } catch (error) {
      console.error('Failed to create therapeutic task:', error);
      throw error;
    }
  }

  // Sync session data
  async syncSessionData(sessionData) {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const sessionId = Date.now();
      const encryptedNotes = sessionData.notes ? await this.encrypt(sessionData.notes) : null;

      const session = {
        userId,
        sessionId,
        type: sessionData.type,
        duration: sessionData.duration,
        completedAt: serverTimestamp(),
        effectiveness: sessionData.effectiveness || null,
        encryptedNotes,
        source: 'selfhypnosis'
      };

      const sessionDocRef = doc(this.db, 'sessions', `${userId}_${sessionId}`);
      await setDoc(sessionDocRef, session);

      // Notify listeners
      this.notifySyncListeners('session:synced', { sessionId, type: sessionData.type });

      return sessionId;
    } catch (error) {
      console.error('Failed to sync session data:', error);
      throw error;
    }
  }

  // Get user premium status
  async getPremiumStatus() {
    const userId = this.getCurrentUserId();
    if (!userId) return false;

    try {
      const userDocRef = doc(this.db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data().isPremium || false;
      }
      return false;
    } catch (error) {
      console.error('Failed to get premium status:', error);
      return false;
    }
  }

  // Update user premium status
  async updatePremiumStatus(isPremium) {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const userDocRef = doc(this.db, 'users', userId);
      await updateDoc(userDocRef, {
        isPremium,
        premiumUpdatedAt: serverTimestamp()
      });

      // Notify listeners
      this.notifySyncListeners('premium:updated', { isPremium });

      return true;
    } catch (error) {
      console.error('Failed to update premium status:', error);
      throw error;
    }
  }

  // Full sync with MomentumFlow
  async syncWithMomentumFlow(force = false) {
    try {
      console.log('Starting full sync with MomentumFlow...');

      // Sync habits and tasks
      const [habits, tasks] = await Promise.all([
        this.syncHabits(),
        this.syncTasks()
      ]);

      // Get premium status
      const isPremium = await this.getPremiumStatus();

      const syncResult = {
        habits: habits.length,
        tasks: tasks.length,
        isPremium,
        syncedAt: new Date()
      };

      // Notify listeners
      this.notifySyncListeners('sync:completed', syncResult);

      console.log('Sync completed:', syncResult);
      return syncResult;
    } catch (error) {
      console.error('Full sync failed:', error);
      this.notifySyncListeners('sync:failed', { error: error.message });
      throw error;
    }
  }

  // Add sync event listener
  addSyncListener(event, callback) {
    if (!this.syncListeners.has(event)) {
      this.syncListeners.set(event, []);
    }
    this.syncListeners.get(event).push(callback);
  }

  // Remove sync event listener
  removeSyncListener(event, callback) {
    if (this.syncListeners.has(event)) {
      const callbacks = this.syncListeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify sync listeners
  notifySyncListeners(event, data) {
    if (this.syncListeners.has(event)) {
      this.syncListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in sync listener:', error);
        }
      });
    }
  }

  // Setup real-time listeners
  setupRealtimeSync() {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    // Listen for habit changes
    const habitsRef = collection(this.db, 'habits');
    const habitsQuery = query(habitsRef, where('userId', '==', userId));
    
    onSnapshot(habitsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          this.notifySyncListeners('habit:changed', {
            id: change.doc.data().id,
            type: change.type,
            data: change.doc.data()
          });
        }
      });
    });

    // Listen for task changes
    const tasksRef = collection(this.db, 'tasks');
    const tasksQuery = query(tasksRef, where('userId', '==', userId));
    
    onSnapshot(tasksQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          this.notifySyncListeners('task:changed', {
            id: change.doc.data().id,
            type: change.type,
            data: change.doc.data()
          });
        }
      });
    });
  }

  // Cleanup
  destroy() {
    this.syncListeners.clear();
    this.currentUser = null;
    this.isInitialized = false;
  }
}

// Create singleton instance
const dataSyncService = new DataSyncService();

export default dataSyncService;

