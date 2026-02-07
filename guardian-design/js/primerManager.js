/**
 * Primer Manager v2 for Guardian
 * Implements deterministic weighted selection with manifest v2 schema
 */

class PrimerManager {
  constructor() {
    this.manifest = null;
    this.currentAudio = null;
    this.activePrimer = null;
    this.sessionId = null;
    this.primerHistory = JSON.parse(localStorage.getItem('guardian_primer_history') || '[]');
    this.usageToday = JSON.parse(localStorage.getItem('guardian_usage_today') || '{}');
    this.isGuidedEnabled = localStorage.getItem('guardian_guided_enabled') !== 'false';
    this.loadManifest();
    this.cleanupOldUsageData();
  }

  async loadManifest() {
    try {
      const response = await fetch('primer-manifest.json');
      this.manifest = await response.json();
      console.log(`Primer manifest v${this.manifest.version} loaded`);
    } catch (e) {
      console.error('Failed to load primer manifest:', e);
    }
  }

  setGuidedEnabled(enabled) {
    this.isGuidedEnabled = enabled;
    localStorage.setItem('guardian_guided_enabled', enabled);
  }

  generateSessionId() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return this.sessionId;
  }

  // Simple seeded random for deterministic selection
  seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  getModeConfig(modeId) {
    if (!this.manifest) return null;
    return this.manifest.modes.find(m => m.mode_id === modeId);
  }

  getEligiblePrimers(modeId) {
    if (!this.manifest) return [];
    
    const modeConfig = this.getModeConfig(modeId);
    if (!modeConfig) return [];

    const poolIds = modeConfig.selection.pool_ids;
    const cooldownSessions = modeConfig.selection.cooldown_sessions;

    // Get primers matching this mode's pools
    let eligiblePrimers = this.manifest.primers.filter(p => 
      p.mode_id === modeId && poolIds.includes(p.pool_id)
    );

    // Apply cooldown filter
    if (cooldownSessions > 0) {
      const recentPrimers = this.primerHistory.slice(-cooldownSessions).map(h => h.primer_id);
      eligiblePrimers = eligiblePrimers.filter(p => !recentPrimers.includes(p.primer_id));
    }

    // Apply daily usage constraints
    const today = new Date().toDateString();
    eligiblePrimers = eligiblePrimers.filter(p => {
      const usageKey = `${p.primer_id}_${today}`;
      const usageCount = this.usageToday[usageKey] || 0;
      return usageCount < p.constraints.max_uses_per_day;
    });

    return eligiblePrimers;
  }

  selectPrimerDeterministic(modeId) {
    const eligiblePrimers = this.getEligiblePrimers(modeId);
    if (eligiblePrimers.length === 0) return null;

    // Calculate total weight
    const totalWeight = eligiblePrimers.reduce((sum, p) => sum + (p.weight || 100), 0);

    // Generate deterministic random number from session_id
    const seed = this.hashString(this.sessionId || 'default');
    const random = this.seededRandom(seed);
    const target = random * totalWeight;

    // Weighted selection
    let cumulative = 0;
    for (const primer of eligiblePrimers) {
      cumulative += (primer.weight || 100);
      if (target <= cumulative) {
        return primer;
      }
    }

    return eligiblePrimers[0]; // Fallback
  }

  trackPrimerUsage(primerId) {
    const today = new Date().toDateString();
    const usageKey = `${primerId}_${today}`;
    this.usageToday[usageKey] = (this.usageToday[usageKey] || 0) + 1;
    localStorage.setItem('guardian_usage_today', JSON.stringify(this.usageToday));

    // Add to history
    this.primerHistory.push({
      primer_id: primerId,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId
    });
    // Keep only last 20 entries
    if (this.primerHistory.length > 20) {
      this.primerHistory = this.primerHistory.slice(-20);
    }
    localStorage.setItem('guardian_primer_history', JSON.stringify(this.primerHistory));
  }

  cleanupOldUsageData() {
    const today = new Date().toDateString();
    const cleanedUsage = {};
    Object.keys(this.usageToday).forEach(key => {
      if (key.endsWith(today)) {
        cleanedUsage[key] = this.usageToday[key];
      }
    });
    this.usageToday = cleanedUsage;
    localStorage.setItem('guardian_usage_today', JSON.stringify(this.usageToday));
  }

  async playPrimer(modeId, onComplete) {
    if (!this.isGuidedEnabled) {
      console.log('Guided primers disabled, skipping to main session');
      if (onComplete) onComplete();
      return;
    }

    // Generate session ID if not exists
    if (!this.sessionId) {
      this.generateSessionId();
    }

    const primer = this.selectPrimerDeterministic(modeId);
    if (!primer) {
      console.warn(`No eligible primer found for mode: ${modeId}`);
      if (onComplete) onComplete();
      return;
    }

    this.activePrimer = primer;
    this.trackPrimerUsage(primer.primer_id);
    
    console.log(`🎧 Primer selected: ${primer.primer_id}`);
    console.log(`   Guidance: ${primer.tags.guidance_style.join(', ')}`);
    console.log(`   Duration: ${primer.audio.duration_sec}s`);
    console.log(`   Mix: Music duck ${primer.audio.mix.duck_music_db}dB, Binaural duck ${primer.audio.mix.duck_binaural_db}dB`);

    // Update UI
    if (window.updatePlayerWithPrimer) {
      window.updatePlayerWithPrimer(primer);
    }

    // Log session start
    if (window.sessionTracker) {
      window.sessionTracker.logSession({
        event_type: 'primer_started',
        session_id: this.sessionId,
        focus_mode: modeId,
        primer_id: primer.primer_id,
        guidance_style: primer.tags.guidance_style,
        slot: primer.slot,
        duration_sec: primer.audio.duration_sec
      });
    }

    // In production, load actual audio file:
    // this.currentAudio = new Audio(primer.audio.src);
    // this.currentAudio.play();
    
    // Mock playback with proper timing
    const duration = primer.audio.duration_sec * 1000;
    const fadeOut = primer.audio.mix.fade_out_ms;

    if (primer.behavior.voice_continues) {
      // Start binaural immediately but keep voice playing
      console.log('Continuous guidance mode - starting binaural alongside');
      if (onComplete) onComplete();
    } else {
      // Pre-task primer: wait for completion
      setTimeout(() => {
        console.log('Primer complete, fading into binaural session');
        if (window.onPrimerComplete) window.onPrimerComplete(primer);
        if (onComplete) onComplete();
      }, duration + fadeOut);
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }

  resetSession() {
    this.sessionId = null;
    this.activePrimer = null;
  }
}

window.primerManager = new PrimerManager();
