/**
 * Binaural Beats Audio Engine for Guardian
 * Generates actual AUDIO binaural beats (not just visuals)
 * Based on self-hypnosis-app binaural beat system
 */

class BinauralBeatsEngine {
  constructor() {
    this.audioContext = null;
    this.oscLeft = null;
    this.oscRight = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.currentPattern = null;

    // Binaural beat patterns (base frequency + beat frequency = brain wave)
    this.patterns = {
      // Delta waves (0.5-4 Hz) - Deep sleep, healing
      delta: {
        baseFreq: 200,
        beatFreq: 2,
        name: 'Delta (Deep Sleep)',
        description: 'Deep sleep and healing'
      },

      // Theta waves (4-8 Hz) - Deep meditation, creativity
      theta: {
        baseFreq: 200,
        beatFreq: 6,
        name: 'Theta (Deep Meditation)',
        description: 'Deep meditation and creativity'
      },

      // Alpha waves (8-13 Hz) - Relaxation, flow state
      alpha: {
        baseFreq: 200,
        beatFreq: 10,
        name: 'Alpha (Relaxation)',
        description: 'Relaxed focus and flow state'
      },

      // Beta waves (13-30 Hz) - Active focus, concentration
      beta_low: {
        baseFreq: 200,
        beatFreq: 15,
        name: 'Beta (Focus)',
        description: 'Active concentration and focus'
      },

      // Schumann resonance (7.83 Hz) - Earth's frequency
      schumann: {
        baseFreq: 200,
        beatFreq: 7.83,
        name: 'Schumann Resonance',
        description: 'Earth grounding frequency'
      }
    };
  }

  /**
   * Initialize Web Audio API
   */
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this;
  }

  /**
   * Start playing binaural beats
   * @param {string} patternName - Pattern to play (delta, theta, alpha, etc.)
   * @param {number} volume - Volume 0-1 (default 0.3)
   */
  start(patternName = 'alpha', volume = 0.3) {
    // Stop any existing playback
    if (this.isPlaying) {
      this.stop();
    }

    // Initialize if needed
    this.init();

    // Get pattern
    const pattern = this.patterns[patternName];
    if (!pattern) {
      console.error(`Pattern "${patternName}" not found`);
      return this;
    }

    this.currentPattern = patternName;

    // Create oscillators
    this.oscLeft = this.audioContext.createOscillator();
    this.oscRight = this.audioContext.createOscillator();

    // Create gain node for volume control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = volume;

    // Create stereo panner for left/right separation
    const pannerLeft = this.audioContext.createStereoPanner();
    pannerLeft.pan.value = -1; // Full left

    const pannerRight = this.audioContext.createStereoPanner();
    pannerRight.pan.value = 1; // Full right

    // Set frequencies
    // Left ear: base frequency
    // Right ear: base frequency + beat frequency
    // Brain perceives the difference as binaural beat
    this.oscLeft.frequency.value = pattern.baseFreq;
    this.oscRight.frequency.value = pattern.baseFreq + pattern.beatFreq;

    // Use sine wave (pure tone, best for binaural beats)
    this.oscLeft.type = 'sine';
    this.oscRight.type = 'sine';

    // Connect audio graph:
    // oscillators → panners → gain → speakers
    this.oscLeft.connect(pannerLeft);
    pannerLeft.connect(this.gainNode);

    this.oscRight.connect(pannerRight);
    pannerRight.connect(this.gainNode);

    this.gainNode.connect(this.audioContext.destination);

    // Fade in to avoid clicking
    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 2);

    // Start playing
    this.oscLeft.start();
    this.oscRight.start();

    this.isPlaying = true;

    console.log(`🎧 Playing ${pattern.name}: ${pattern.baseFreq}Hz (L) + ${pattern.baseFreq + pattern.beatFreq}Hz (R) = ${pattern.beatFreq}Hz beat`);

    return this;
  }

  /**
   * Stop playing binaural beats
   */
  stop() {
    if (!this.isPlaying) return this;

    // Fade out to avoid clicking
    const fadeOutTime = 2;
    this.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + fadeOutTime);

    // Stop oscillators after fade out
    setTimeout(() => {
      if (this.oscLeft) {
        this.oscLeft.stop();
        this.oscLeft.disconnect();
        this.oscLeft = null;
      }

      if (this.oscRight) {
        this.oscRight.stop();
        this.oscRight.disconnect();
        this.oscRight = null;
      }

      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }

      this.isPlaying = false;
      console.log('🎧 Binaural beats stopped');
    }, fadeOutTime * 1000);

    return this;
  }

  /**
   * Change volume
   * @param {number} volume - New volume 0-1
   */
  setVolume(volume) {
    if (this.gainNode && this.isPlaying) {
      this.gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.1);
    }
    return this;
  }

  /**
   * Get available patterns
   */
  getPatterns() {
    return Object.keys(this.patterns).map(key => ({
      id: key,
      ...this.patterns[key]
    }));
  }

  /**
   * Get current playing state
   */
  getState() {
    return {
      isPlaying: this.isPlaying,
      currentPattern: this.currentPattern,
      pattern: this.currentPattern ? this.patterns[this.currentPattern] : null
    };
  }
}

// Create global instance
window.binauralBeatsEngine = new BinauralBeatsEngine();
