// Audio optimization utilities for improved performance

class AudioManager {
  constructor() {
    this.audioCache = new Map();
    this.loadingPromises = new Map();
    this.preloadQueue = [];
    this.maxCacheSize = 20;
    this.compressionEnabled = true;
  }

  // Preload audio files for better performance
  async preloadAudio(audioUrl, priority = 'normal') {
    if (this.audioCache.has(audioUrl)) {
      return this.audioCache.get(audioUrl);
    }

    if (this.loadingPromises.has(audioUrl)) {
      return this.loadingPromises.get(audioUrl);
    }

    const loadPromise = this.loadAudioFile(audioUrl);
    this.loadingPromises.set(audioUrl, loadPromise);

    try {
      const audio = await loadPromise;
      this.cacheAudio(audioUrl, audio);
      this.loadingPromises.delete(audioUrl);
      return audio;
    } catch (error) {
      this.loadingPromises.delete(audioUrl);
      throw error;
    }
  }

  // Load audio file with optimization
  async loadAudioFile(audioUrl) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      // Optimize audio loading
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      
      // Performance optimizations
      if (this.compressionEnabled) {
        audio.setAttribute('data-compressed', 'true');
      }

      const handleLoad = () => {
        audio.removeEventListener('canplaythrough', handleLoad);
        audio.removeEventListener('error', handleError);
        resolve(audio);
      };

      const handleError = (error) => {
        audio.removeEventListener('canplaythrough', handleLoad);
        audio.removeEventListener('error', handleError);
        reject(new Error(`Failed to load audio: ${audioUrl}`));
      };

      audio.addEventListener('canplaythrough', handleLoad);
      audio.addEventListener('error', handleError);
      
      audio.src = audioUrl;
    });
  }

  // Cache management with LRU eviction
  cacheAudio(url, audio) {
    // Remove oldest if cache is full
    if (this.audioCache.size >= this.maxCacheSize) {
      const firstKey = this.audioCache.keys().next().value;
      const oldAudio = this.audioCache.get(firstKey);
      if (oldAudio && oldAudio.src) {
        oldAudio.src = '';
      }
      this.audioCache.delete(firstKey);
    }

    this.audioCache.set(url, audio);
  }

  // Get cached audio
  getCachedAudio(url) {
    if (this.audioCache.has(url)) {
      // Move to end (LRU)
      const audio = this.audioCache.get(url);
      this.audioCache.delete(url);
      this.audioCache.set(url, audio);
      return audio;
    }
    return null;
  }

  // Play audio with optimization
  async playAudio(audioUrl, options = {}) {
    const { 
      volume = 1, 
      loop = false, 
      fadeIn = false, 
      fadeInDuration = 1000 
    } = options;

    let audio = this.getCachedAudio(audioUrl);
    
    if (!audio) {
      audio = await this.preloadAudio(audioUrl);
    }

    // Clone audio for concurrent playback
    const playableAudio = audio.cloneNode();
    playableAudio.volume = fadeIn ? 0 : volume;
    playableAudio.loop = loop;

    // Fade in effect
    if (fadeIn) {
      this.fadeInAudio(playableAudio, volume, fadeInDuration);
    }

    try {
      await playableAudio.play();
      return playableAudio;
    } catch (error) {
      console.error('Audio playback failed:', error);
      throw error;
    }
  }

  // Fade in audio
  fadeInAudio(audio, targetVolume, duration) {
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(volumeStep * currentStep, targetVolume);
      
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
      }
    }, stepDuration);
  }

  // Fade out audio
  fadeOutAudio(audio, duration = 1000) {
    return new Promise((resolve) => {
      const startVolume = audio.volume;
      const steps = 20;
      const stepDuration = duration / steps;
      const volumeStep = startVolume / steps;
      let currentStep = 0;

      const fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.max(startVolume - (volumeStep * currentStep), 0);
        
        if (currentStep >= steps || audio.volume <= 0) {
          clearInterval(fadeInterval);
          audio.pause();
          resolve();
        }
      }, stepDuration);
    });
  }

  // Stop all audio
  stopAllAudio() {
    this.audioCache.forEach(audio => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }

  // Clear cache
  clearCache() {
    this.stopAllAudio();
    this.audioCache.clear();
    this.loadingPromises.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return {
      cacheSize: this.audioCache.size,
      maxCacheSize: this.maxCacheSize,
      loadingCount: this.loadingPromises.size,
      cachedUrls: Array.from(this.audioCache.keys())
    };
  }
}

// Web Audio API optimization for advanced audio processing
class WebAudioManager {
  constructor() {
    this.audioContext = null;
    this.gainNode = null;
    this.analyserNode = null;
    this.bufferCache = new Map();
  }

  // Initialize Web Audio API
  async initializeAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.analyserNode = this.audioContext.createAnalyser();
      
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioContext.destination);
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Load and decode audio buffer
  async loadAudioBuffer(audioUrl) {
    if (this.bufferCache.has(audioUrl)) {
      return this.bufferCache.get(audioUrl);
    }

    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.bufferCache.set(audioUrl, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error('Failed to load audio buffer:', error);
      throw error;
    }
  }

  // Play audio buffer with Web Audio API
  async playAudioBuffer(audioUrl, options = {}) {
    await this.initializeAudioContext();
    
    const buffer = await this.loadAudioBuffer(audioUrl);
    const source = this.audioContext.createBufferSource();
    
    source.buffer = buffer;
    source.connect(this.gainNode);
    
    // Apply options
    if (options.loop) {
      source.loop = true;
    }
    
    if (options.volume !== undefined) {
      this.gainNode.gain.value = options.volume;
    }

    source.start(0);
    return source;
  }

  // Generate binaural beats
  generateBinauralBeats(leftFreq, rightFreq, duration = 10) {
    const sampleRate = this.audioContext.sampleRate;
    const frameCount = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(2, frameCount, sampleRate);

    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);

    for (let i = 0; i < frameCount; i++) {
      const time = i / sampleRate;
      leftChannel[i] = Math.sin(2 * Math.PI * leftFreq * time) * 0.3;
      rightChannel[i] = Math.sin(2 * Math.PI * rightFreq * time) * 0.3;
    }

    return buffer;
  }

  // Apply audio effects
  applyLowPassFilter(source, frequency = 1000) {
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = frequency;
    
    source.disconnect();
    source.connect(filter);
    filter.connect(this.gainNode);
    
    return filter;
  }

  // Clean up resources
  cleanup() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.bufferCache.clear();
  }
}

// Singleton instances
export const audioManager = new AudioManager();
export const webAudioManager = new WebAudioManager();

// Utility functions
export const preloadCriticalAudio = async () => {
  const criticalAudioFiles = [
    '/audio/authority_confidence_affirmations.wav',
    '/audio/sovereignty_activation.wav',
    '/audio/grounding_meditation.wav'
  ];

  const preloadPromises = criticalAudioFiles.map(url => 
    audioManager.preloadAudio(url, 'high').catch(error => 
      console.warn(`Failed to preload ${url}:`, error)
    )
  );

  await Promise.allSettled(preloadPromises);
};

export const optimizeAudioForMobile = () => {
  // Reduce cache size on mobile devices
  if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    audioManager.maxCacheSize = 10;
    audioManager.compressionEnabled = true;
  }
};

// Initialize optimizations
optimizeAudioForMobile();

