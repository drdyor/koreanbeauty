/**
 * Lazy-loaded component wrappers for performance optimization
 * Implements code splitting and lazy loading for better performance
 */

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Loading fallback component
const LoadingFallback = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center gap-2">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  </div>
);

// Lazy-loaded components with proper error boundaries
const createLazyComponent = (importFn, fallbackMessage) => {
  const LazyComponent = React.lazy(importFn);
  
  return React.forwardRef((props, ref) => (
    <Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));
};

// Core therapeutic components (lazy-loaded)
export const LazyEnhancedSleepMode = createLazyComponent(
  () => import('./EnhancedSleepMode.jsx'),
  "Loading Sleep Mode..."
);

export const LazyEnhancedWakeMode = createLazyComponent(
  () => import('./EnhancedWakeMode.jsx'),
  "Loading Wake Mode..."
);

export const LazyLightFrequencyTherapy = createLazyComponent(
  () => import('./LightFrequencyTherapy.jsx'),
  "Loading Light Frequency Therapy..."
);

export const LazyMediaPipeMonitor = createLazyComponent(
  () => import('./MediaPipeMonitor.jsx'),
  "Loading Safety Monitor..."
);

// Therapeutic exercise components (lazy-loaded)
export const LazySomaticExperiencing = createLazyComponent(
  () => import('./SomaticExperiencing.jsx'),
  "Loading Somatic Exercises..."
);

export const LazyPolyvagalExercises = createLazyComponent(
  () => import('./PolyvagalExercises.jsx'),
  "Loading Polyvagal Exercises..."
);

export const LazyIFSJournaling = createLazyComponent(
  () => import('./IFSJournaling.jsx'),
  "Loading IFS Journaling..."
);

export const LazyFearPatternForm = createLazyComponent(
  () => import('./FearPatternForm.jsx'),
  "Loading Fear Pattern Analysis..."
);

// Performance monitoring component
export const PerformanceMonitor = React.memo(() => {
  const [metrics, setMetrics] = React.useState(null);
  const [showMetrics, setShowMetrics] = React.useState(false);

  React.useEffect(() => {
    const updateMetrics = () => {
      if (performance.memory) {
        setMetrics({
          memory: {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
          },
          timing: {
            domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
            loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart
          }
        });
      }
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics || !showMetrics) {
    return (
      <button
        onClick={() => setShowMetrics(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-xs opacity-50 hover:opacity-100"
      >
        Performance
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded text-xs max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Performance</span>
        <button onClick={() => setShowMetrics(false)} className="text-gray-400 hover:text-white">×</button>
      </div>
      <div className="space-y-1">
        <div>Memory: {metrics.memory.used}MB / {metrics.memory.total}MB</div>
        <div>Load: {metrics.timing.loadComplete}ms</div>
        <div className="w-full bg-gray-600 rounded-full h-1">
          <div 
            className="bg-green-500 h-1 rounded-full" 
            style={{ width: `${(metrics.memory.used / metrics.memory.total) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
});

// Optimized list component with virtual scrolling
export const VirtualizedList = React.memo(({ 
  items, 
  itemHeight = 60, 
  containerHeight = 400, 
  renderItem,
  className = ""
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef(null);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 2,
    items.length
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  const handleScroll = React.useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={visibleStart + index} style={{ height: itemHeight }}>
              {renderItem(item, visibleStart + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Optimized image component with lazy loading
export const OptimizedImage = React.memo(({ 
  src, 
  alt, 
  className = "", 
  placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+",
  ...props 
}) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const imgRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-50'} ${className}`}
      onLoad={() => setIsLoaded(true)}
      {...props}
    />
  );
});

// Debounced input component
export const DebouncedInput = React.memo(({ 
  value, 
  onChange, 
  delay = 300, 
  ...props 
}) => {
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange, delay]);

  return (
    <input
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
    />
  );
});

// Error boundary for lazy components
export class LazyComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 rounded bg-red-50">
          <h3 className="text-red-800 font-semibold mb-2">Component Error</h3>
          <p className="text-red-600 text-sm">
            Failed to load component. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default {
  LazyEnhancedSleepMode,
  LazyEnhancedWakeMode,
  LazyLightFrequencyTherapy,
  LazyMediaPipeMonitor,
  LazySomaticExperiencing,
  LazyPolyvagalExercises,
  LazyIFSJournaling,
  LazyFearPatternForm,
  PerformanceMonitor,
  VirtualizedList,
  OptimizedImage,
  DebouncedInput,
  LazyComponentErrorBoundary
};

