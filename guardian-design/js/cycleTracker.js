/**
 * Cycle Tracker for Body Boundary
 * Tracks menstrual cycle, sleep, energy, and symptoms
 */

class CycleTracker {
  constructor() {
    this.dbName = 'BodyBoundaryDB';
    this.dbVersion = 2;
    this.db = null;
    this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create cycle logs store
        if (!db.objectStoreNames.contains('cycleLogs')) {
          const store = db.createObjectStore('cycleLogs', { keyPath: 'date' });
          store.createIndex('date', 'date', { unique: true });
        }
        
        // Create settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('Cycle Tracker initialized');
        resolve();
      };

      request.onerror = (event) => {
        console.error('Cycle Tracker DB error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // Cycle Phase Calculation
  getCycleDay(periodStart) {
    if (!periodStart) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(periodStart);
    start.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return (daysDiff % 28) + 1; // Assume 28-day cycle
  }

  getPhase(cycleDay) {
    if (!cycleDay) return 'unknown';
    if (cycleDay <= 5) return 'menstrual';
    if (cycleDay <= 13) return 'follicular';
    if (cycleDay <= 17) return 'ovulation';
    return 'luteal';
  }

  getPhaseEmoji(phase) {
    const emojis = {
      menstrual: '🌙',
      follicular: '🌱',
      ovulation: '✨',
      luteal: '🍂',
      unknown: '❓'
    };
    return emojis[phase] || '❓';
  }

  getPhaseLabel(phase) {
    const labels = {
      menstrual: 'Menstrual',
      follicular: 'Follicular',
      ovulation: 'Ovulation',
      luteal: 'Luteal',
      unknown: 'Unknown'
    };
    return labels[phase] || 'Unknown';
  }

  // Settings Management
  async savePeriodStart(date) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key: 'periodStart', value: date });

      request.onsuccess = () => {
        console.log('Period start saved:', date);
        resolve();
      };
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async getPeriodStart() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('periodStart');

      request.onsuccess = () => {
        resolve(request.result?.value || null);
      };
      request.onerror = (event) => reject(event.target.error);
    });
  }

  // Daily Log Management
  async saveDailyLog(logData) {
    if (!this.db) await this.init();
    
    const today = new Date().toISOString().split('T')[0];
    const periodStart = await this.getPeriodStart();
    const cycleDay = this.getCycleDay(periodStart);
    const phase = this.getPhase(cycleDay);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cycleLogs'], 'readwrite');
      const store = transaction.objectStore('cycleLogs');
      const request = store.put({
        date: today,
        cycleDay: cycleDay,
        phase: phase,
        sleep: logData.sleep,
        energy: logData.energy,
        focusQuality: logData.focusQuality,
        symptoms: logData.symptoms,
        timestamp: new Date().toISOString()
      });

      request.onsuccess = () => {
        console.log('Daily log saved for', today);
        resolve();
      };
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async getDailyLog(date) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cycleLogs'], 'readonly');
      const store = transaction.objectStore('cycleLogs');
      const request = store.get(date);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async getAllDailyLogs() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cycleLogs'], 'readonly');
      const store = transaction.objectStore('cycleLogs');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async getTodayLog() {
    const today = new Date().toISOString().split('T')[0];
    return this.getDailyLog(today);
  }

  async hasLoggedToday() {
    const log = await this.getTodayLog();
    return log !== null;
  }

  // Current Cycle Info
  async getCurrentCycleInfo() {
    const periodStart = await this.getPeriodStart();
    if (!periodStart) {
      return {
        hasSetup: false,
        cycleDay: null,
        phase: 'unknown',
        phaseEmoji: '❓',
        phaseLabel: 'Unknown'
      };
    }

    const cycleDay = this.getCycleDay(periodStart);
    const phase = this.getPhase(cycleDay);
    
    return {
      hasSetup: true,
      cycleDay: cycleDay,
      phase: phase,
      phaseEmoji: this.getPhaseEmoji(phase),
      phaseLabel: this.getPhaseLabel(phase)
    };
  }

  // Pattern Analysis
  async calculatePatterns() {
    const logs = await this.getAllDailyLogs();
    const sessions = await window.sessionTracker.getAllSessions();
    
    if (logs.length < 10) {
      return {
        hasEnoughData: false,
        message: `Log ${10 - logs.length} more days to see patterns`
      };
    }

    // Group data by phase
    const byPhase = {
      menstrual: { sessions: [], sleep: [], energy: [], focusQuality: [] },
      follicular: { sessions: [], sleep: [], energy: [], focusQuality: [] },
      ovulation: { sessions: [], sleep: [], energy: [], focusQuality: [] },
      luteal: { sessions: [], sleep: [], energy: [], focusQuality: [] }
    };

    // Organize logs by phase
    logs.forEach(log => {
      if (log.phase && log.phase !== 'unknown') {
        byPhase[log.phase].sleep.push(parseFloat(log.sleep));
        byPhase[log.phase].energy.push(parseInt(log.energy));
        byPhase[log.phase].focusQuality.push(parseInt(log.focusQuality));
      }
    });

    // Match sessions to logs
    sessions.forEach(session => {
      if (session.event_type === 'session_complete' && session.session_duration_sec) {
        const date = session.timestamp.split('T')[0];
        const log = logs.find(l => l.date === date);
        if (log && log.phase && log.phase !== 'unknown') {
          byPhase[log.phase].sessions.push(session.session_duration_sec / 60); // minutes
        }
      }
    });

    // Calculate insights
    const insights = [];

    // Session duration by phase
    const phases = ['follicular', 'ovulation', 'luteal', 'menstrual'];
    const sessionAvgs = {};
    phases.forEach(phase => {
      if (byPhase[phase].sessions.length > 0) {
        sessionAvgs[phase] = this.average(byPhase[phase].sessions);
      }
    });

    const bestPhase = Object.keys(sessionAvgs).reduce((a, b) => 
      sessionAvgs[a] > sessionAvgs[b] ? a : b
    );
    const worstPhase = Object.keys(sessionAvgs).reduce((a, b) => 
      sessionAvgs[a] < sessionAvgs[b] ? a : b
    );

    if (sessionAvgs[bestPhase] && sessionAvgs[worstPhase]) {
      const diff = ((sessionAvgs[bestPhase] - sessionAvgs[worstPhase]) / sessionAvgs[worstPhase] * 100).toFixed(0);
      insights.push({
        icon: '🎯',
        text: `Focus sessions are ${diff}% longer during ${this.getPhaseLabel(bestPhase).toLowerCase()} phase (${sessionAvgs[bestPhase].toFixed(0)}min vs ${sessionAvgs[worstPhase].toFixed(0)}min)`
      });
    }

    // Sleep correlation
    const lowSleepDays = logs.filter(l => parseFloat(l.sleep) < 6);
    const goodSleepDays = logs.filter(l => parseFloat(l.sleep) >= 7);
    
    if (lowSleepDays.length > 2 && goodSleepDays.length > 2) {
      const lowSleepEnergy = this.average(lowSleepDays.map(l => parseInt(l.energy)));
      const goodSleepEnergy = this.average(goodSleepDays.map(l => parseInt(l.energy)));
      
      if (goodSleepEnergy > lowSleepEnergy) {
        const diff = ((goodSleepEnergy - lowSleepEnergy) / lowSleepEnergy * 100).toFixed(0);
        insights.push({
          icon: '😴',
          text: `On days with 7+ hours of sleep, your energy is ${diff}% higher`
        });
      }
    }

    // Symptom patterns
    const brainFogByPhase = {};
    phases.forEach(phase => {
      const phaseLogs = logs.filter(l => l.phase === phase);
      if (phaseLogs.length > 0) {
        const brainFogCount = phaseLogs.filter(l => l.symptoms?.brainFog).length;
        brainFogByPhase[phase] = (brainFogCount / phaseLogs.length * 100).toFixed(0);
      }
    });

    const maxBrainFogPhase = Object.keys(brainFogByPhase).reduce((a, b) => 
      parseInt(brainFogByPhase[a]) > parseInt(brainFogByPhase[b]) ? a : b
    );

    if (brainFogByPhase[maxBrainFogPhase] && parseInt(brainFogByPhase[maxBrainFogPhase]) > 30) {
      insights.push({
        icon: '🧠',
        text: `Brain fog is most common during ${this.getPhaseLabel(maxBrainFogPhase).toLowerCase()} phase (${brainFogByPhase[maxBrainFogPhase]}% of days)`
      });
    }

    return {
      hasEnoughData: true,
      insights: insights,
      phaseAverages: {
        sessions: sessionAvgs,
        sleep: this.averageByPhase(byPhase, 'sleep'),
        energy: this.averageByPhase(byPhase, 'energy')
      }
    };
  }

  average(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  averageByPhase(byPhase, field) {
    const result = {};
    Object.keys(byPhase).forEach(phase => {
      if (byPhase[phase][field].length > 0) {
        result[phase] = this.average(byPhase[phase][field]);
      }
    });
    return result;
  }
}

window.cycleTracker = new CycleTracker();
