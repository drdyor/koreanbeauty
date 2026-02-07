/**
 * Performance Optimization Utilities
 * Comprehensive performance monitoring and optimization tools
 */

// Performance monitoring
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      componentRenders: new Map(),
      memoryUsage: [],
      loadTimes: new Map(),
      userInteractions: []
    };
    this.observers = new Set();
  }

  // Monitor component render performance
  trackComponentRender(componentName, renderTime) {
    const current = this.metrics.componentRenders.get(componentName) || { count: 0, totalTime: 0 };
    current.count++;
    current.totalTime += renderTime;
    current.averageTime = current.totalTime / current.count;
    this.metrics.componentRenders.set(componentName, current);
  }

  // Monitor memory usage
  trackMemoryUsage() {
    if (performance.memory) {
      const memInfo = {
        timestamp: Date.now(),
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
      this.metrics.memoryUsage.push(memInfo);
      
      // Keep only last 100 measurements
      if (this.metrics.memoryUsage.length > 100) {
        this.metrics.memoryUsage.shift();
      }
    }
  }

  // Monitor load times
  trackLoadTime(resource, loadTime) {
    this.metrics.loadTimes.set(resource, loadTime);
  }

  // Get performance report
  getReport() {
    return {
      components: Object.fromEntries(this.metrics.componentRenders),
      memory: this.getMemoryStats(),
      loadTimes: Object.fromEntries(this.metrics.loadTimes),
      interactions: this.metrics.userInteractions.length
    };
  }

  getMemoryStats() {
    if (this.metrics.memoryUsage.length === 0) return null;
    
    const latest = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
    const peak = Math.max(...this.metrics.memoryUsage.map(m => m.used));
    const average = this.metrics.memoryUsage.reduce((sum, m) => sum + m.used, 0) / this.metrics.memoryUsage.length;
    
    return {
      current: latest.used,
      peak,
      average,
      utilization: (latest.used / latest.total) * 100
    };
  }
}

// Lazy loading utilities (moved to LazyLoadedComponents.jsx)
export const createLazyComponent = (importFunc, fallback = null) => {
  // This function should be used in JSX files, not here
  throw new Error('createLazyComponent should be imported from LazyLoadedComponents.jsx');
};

// Debounce utility for performance (moved to hooks file)
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Throttle utility for performance
export const throttle = (func, interval) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= interval) {
      lastCall = now;
      return func.apply(null, args);
    }
  };
};

// Memory-efficient audio manager
export class AudioManager {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
    this.activeAudio = new Map();
    this.audioPool = [];
    this.preloadedAudio = new Map();
  }

  async preloadAudio(url, priority = 'low') {
    if (this.preloadedAudio.has(url)) {
      return this.preloadedAudio.get(url);
    }

    const audio = new Audio();
    const loadPromise = new Promise((resolve, reject) => {
      audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
      audio.addEventListener('error', reject, { once: true });
    });

    audio.preload = priority === 'high' ? 'auto' : 'metadata';
    audio.src = url;

    try {
      await loadPromise;
      this.preloadedAudio.set(url, audio);
      return audio;
    } catch (error) {
      console.warn(`Failed to preload audio: ${url}`, error);
      return null;
    }
  }

  async playAudio(url, options = {}) {
    // Check concurrent limit
    if (this.activeAudio.size >= this.maxConcurrent) {
      const oldestKey = this.activeAudio.keys().next().value;
      this.stopAudio(oldestKey);
    }

    let audio = this.preloadedAudio.get(url);
    if (!audio) {
      audio = await this.preloadAudio(url, 'high');
      if (!audio) return null;
    }

    // Clone audio for concurrent playback
    const audioInstance = audio.cloneNode();
    audioInstance.volume = options.volume || 0.5;
    audioInstance.loop = options.loop || false;

    const playPromise = audioInstance.play();
    this.activeAudio.set(url, audioInstance);

    // Cleanup when finished
    audioInstance.addEventListener('ended', () => {
      this.activeAudio.delete(url);
    });

    return playPromise;
  }

  stopAudio(url) {
    const audio = this.activeAudio.get(url);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      this.activeAudio.delete(url);
    }
  }

  stopAll() {
    this.activeAudio.forEach((audio, url) => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.activeAudio.clear();
  }

  cleanup() {
    this.stopAll();
    this.preloadedAudio.clear();
    this.audioPool.length = 0;
  }
}

// Virtual scrolling utility (moved to hooks file)
export const calculateVirtualScrolling = (items, itemHeight, containerHeight, scrollTop) => {
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    visibleStart,
    visibleEnd
  };
};

// Bundle splitting utilities (simplified)
export const loadChunk = async (chunkName) => {
  try {
    // Simplified chunk loading without dynamic variables
    console.log(`Loading chunk: ${chunkName}`);
    return null; // Placeholder for actual chunk loading
  } catch (error) {
    console.error(`Failed to load chunk: ${chunkName}`, error);
    return null;
  }
};

// Performance metrics collection
export const collectPerformanceMetrics = () => {
  const navigation = performance.getEntriesByType('navigation')[0];
  const paint = performance.getEntriesByType('paint');
  
  return {
    // Navigation timing
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    
    // Paint timing
    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
    
    // Memory (if available)
    memory: performance.memory ? {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    } : null
  };
};

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Start automatic memory monitoring
if (typeof window !== 'undefined') {
  setInterval(() => {
    performanceMonitor.trackMemoryUsage();
  }, 5000); // Track every 5 seconds
}

