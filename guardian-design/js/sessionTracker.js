/**
 * Session Tracker for Guardian
 * Uses IndexedDB to log research-grade cognitive performance data.
 */

class SessionTracker {
  constructor() {
    this.dbName = 'GuardianResearchDB';
    this.dbVersion = 1;
    this.db = null;
    this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('Research Database initialized');
        resolve();
      };

      request.onerror = (event) => {
        console.error('Database error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async logSession(sessionData) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      const request = store.add({
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        ...sessionData
      });

      request.onsuccess = () => {
        console.log(`📊 Logged: ${sessionData.event_type}`);
        resolve(request.result);
      };
      request.onerror = (event) => reject(event.target.error);
    });
  }

  // Enhanced fatigue tracking for v2
  async logPrimerSkipped(modeId, primerId, sessionId) {
    return this.logSession({
      event_type: 'primer_skipped',
      session_id: sessionId,
      focus_mode: modeId,
      primer_id: primerId,
      primer_completed: false,
      notes: 'User manually skipped primer'
    });
  }

  async logPrimerCompleted(modeId, primerId, sessionId, durationSec) {
    return this.logSession({
      event_type: 'primer_completed',
      session_id: sessionId,
      focus_mode: modeId,
      primer_id: primerId,
      primer_completed: true,
      actual_duration_sec: durationSec
    });
  }

  async getAllSessions() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async exportData() {
    const data = await this.getAllSessions();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guardian_sessions_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log(`📊 Exported ${data.length} session records`);
  }

  async exportCSV() {
    const data = await this.getAllSessions();
    if (data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Get all unique keys
    const keys = [...new Set(data.flatMap(Object.keys))];
    
    // Create CSV header
    const csv = [
      keys.join(','),
      ...data.map(row => 
        keys.map(key => {
          const value = row[key];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value).replace(/,/g, ';');
          return String(value).replace(/,/g, ';');
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guardian_sessions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    console.log(`📊 Exported ${data.length} records as CSV`);
  }

  async getAnalytics() {
    const data = await this.getAllSessions();
    
    const analytics = {
      total_sessions: data.length,
      primers_by_mode: {},
      avg_rating_by_primer: {},
      completion_rate: 0,
      fatigue_events: 0
    };

    data.forEach(session => {
      if (session.focus_mode) {
        analytics.primers_by_mode[session.focus_mode] = 
          (analytics.primers_by_mode[session.focus_mode] || 0) + 1;
      }
      
      if (session.event_type === 'session_complete') {
        analytics.completion_rate++;
      }

      if (session.event_type === 'fatigue_toggle_off') {
        analytics.fatigue_events++;
      }

      if (session.event_type === 'primer_rating' && session.primer_id) {
        if (!analytics.avg_rating_by_primer[session.primer_id]) {
          analytics.avg_rating_by_primer[session.primer_id] = { total: 0, count: 0 };
        }
        analytics.avg_rating_by_primer[session.primer_id].total += session.rating;
        analytics.avg_rating_by_primer[session.primer_id].count++;
      }
    });

    // Calculate averages
    Object.keys(analytics.avg_rating_by_primer).forEach(primerId => {
      const data = analytics.avg_rating_by_primer[primerId];
      analytics.avg_rating_by_primer[primerId] = (data.total / data.count).toFixed(2);
    });

    console.table(analytics);
    return analytics;
  }

  // Tracking Fatigue: Specifically logging the OFF toggle event
  async logFatigueEvent(modeId, primerId) {
    return this.logSession({
      event_type: 'fatigue_toggle_off',
      focus_mode: modeId,
      primer_id: primerId,
      notes: 'User toggled primer OFF after mode selection'
    });
  }
}

window.sessionTracker = new SessionTracker();
