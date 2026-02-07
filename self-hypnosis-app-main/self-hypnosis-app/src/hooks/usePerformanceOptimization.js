import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Hook for optimized audio loading and caching
export const useOptimizedAudio = () => {
  const audioCache = useRef(new Map());
  const [loadingAudio, setLoadingAudio] = useState(new Set());

  const preloadAudio = useCallback(async (audioUrl) => {
    if (audioCache.current.has(audioUrl) || loadingAudio.has(audioUrl)) {
      return audioCache.current.get(audioUrl);
    }

    setLoadingAudio(prev => new Set(prev).add(audioUrl));

    try {
      const audio = new Audio();
      audio.preload = 'auto';
      
      return new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => {
          audioCache.current.set(audioUrl, audio);
          setLoadingAudio(prev => {
            const newSet = new Set(prev);
            newSet.delete(audioUrl);
            return newSet;
          });
          resolve(audio);
        });

        audio.addEventListener('error', (error) => {
          setLoadingAudio(prev => {
            const newSet = new Set(prev);
            newSet.delete(audioUrl);
            return newSet;
          });
          reject(error);
        });

        audio.src = audioUrl;
      });
    } catch (error) {
      setLoadingAudio(prev => {
        const newSet = new Set(prev);
        newSet.delete(audioUrl);
        return newSet;
      });
      throw error;
    }
  }, [loadingAudio]);

  const getAudio = useCallback((audioUrl) => {
    return audioCache.current.get(audioUrl);
  }, []);

  const clearCache = useCallback(() => {
    audioCache.current.clear();
  }, []);

  return {
    preloadAudio,
    getAudio,
    clearCache,
    isLoading: (url) => loadingAudio.has(url),
    cacheSize: audioCache.current.size
  };
};

// Hook for memory optimization and cleanup
export const useMemoryOptimization = () => {
  const cleanupFunctions = useRef([]);

  const addCleanup = useCallback((cleanupFn) => {
    cleanupFunctions.current.push(cleanupFn);
  }, []);

  const cleanup = useCallback(() => {
    cleanupFunctions.current.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.warn('Cleanup function error:', error);
      }
    });
    cleanupFunctions.current = [];
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { addCleanup, cleanup };
};

// Hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0
  });

  const startTimer = useCallback((name) => {
    performance.mark(`${name}-start`);
  }, []);

  const endTimer = useCallback((name) => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name)[0];
    return measure ? measure.duration : 0;
  }, []);

  const measureRender = useCallback((componentName, renderFn) => {
    startTimer(`render-${componentName}`);
    const result = renderFn();
    const duration = endTimer(`render-${componentName}`);
    
    setMetrics(prev => ({
      ...prev,
      renderTime: prev.renderTime + duration,
      componentCount: prev.componentCount + 1
    }));

    return result;
  }, [startTimer, endTimer]);

  const getMemoryUsage = useCallback(() => {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }, []);

  const updateMemoryMetrics = useCallback(() => {
    const memory = getMemoryUsage();
    if (memory) {
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.used
      }));
    }
  }, [getMemoryUsage]);

  useEffect(() => {
    const interval = setInterval(updateMemoryMetrics, 5000);
    return () => clearInterval(interval);
  }, [updateMemoryMetrics]);

  return {
    metrics,
    startTimer,
    endTimer,
    measureRender,
    getMemoryUsage,
    updateMemoryMetrics
  };
};

// Hook for optimized state management
export const useOptimizedState = (initialState, options = {}) => {
  const { 
    debounceMs = 0, 
    throttleMs = 0, 
    persist = false, 
    persistKey = 'optimized-state' 
  } = options;

  const [state, setState] = useState(() => {
    if (persist && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(persistKey);
        return saved ? JSON.parse(saved) : initialState;
      } catch {
        return initialState;
      }
    }
    return initialState;
  });

  const debounceRef = useRef();
  const throttleRef = useRef();

  const optimizedSetState = useCallback((newState) => {
    const updateState = (value) => {
      setState(prevState => {
        const nextState = typeof value === 'function' ? value(prevState) : value;
        
        if (persist && typeof window !== 'undefined') {
          try {
            localStorage.setItem(persistKey, JSON.stringify(nextState));
          } catch (error) {
            console.warn('Failed to persist state:', error);
          }
        }
        
        return nextState;
      });
    };

    if (debounceMs > 0) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => updateState(newState), debounceMs);
    } else if (throttleMs > 0) {
      if (!throttleRef.current) {
        updateState(newState);
        throttleRef.current = setTimeout(() => {
          throttleRef.current = null;
        }, throttleMs);
      }
    } else {
      updateState(newState);
    }
  }, [debounceMs, throttleMs, persist, persistKey]);

  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current);
      clearTimeout(throttleRef.current);
    };
  }, []);

  return [state, optimizedSetState];
};

// Hook for component virtualization
export const useVirtualization = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, []);

  return {
    visibleItems,
    handleScroll,
    scrollTop
  };
};

// Hook for request caching
export const useRequestCache = (maxSize = 100) => {
  const cache = useRef(new Map());
  const accessOrder = useRef([]);

  const get = useCallback((key) => {
    if (cache.current.has(key)) {
      // Update access order
      const index = accessOrder.current.indexOf(key);
      if (index > -1) {
        accessOrder.current.splice(index, 1);
      }
      accessOrder.current.push(key);
      
      return cache.current.get(key);
    }
    return null;
  }, []);

  const set = useCallback((key, value) => {
    // Remove oldest if cache is full
    if (cache.current.size >= maxSize && !cache.current.has(key)) {
      const oldest = accessOrder.current.shift();
      if (oldest) {
        cache.current.delete(oldest);
      }
    }

    cache.current.set(key, value);
    
    // Update access order
    const index = accessOrder.current.indexOf(key);
    if (index > -1) {
      accessOrder.current.splice(index, 1);
    }
    accessOrder.current.push(key);
  }, [maxSize]);

  const clear = useCallback(() => {
    cache.current.clear();
    accessOrder.current = [];
  }, []);

  const has = useCallback((key) => {
    return cache.current.has(key);
  }, []);

  return { get, set, clear, has, size: cache.current.size };
};

