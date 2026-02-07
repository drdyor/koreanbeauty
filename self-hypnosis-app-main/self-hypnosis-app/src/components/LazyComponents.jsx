import React, { lazy, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Loader2 } from 'lucide-react';

// Lazy load heavy components for better performance
const EnhancedWakeMode = lazy(() => import('./EnhancedWakeMode.jsx'));
const EnhancedSleepMode = lazy(() => import('./EnhancedSleepMode.jsx'));
const FearPatternForm = lazy(() => import('./FearPatternForm.jsx'));
const SomaticExperiencing = lazy(() => import('./SomaticExperiencing.jsx'));
const PolyvagalExercises = lazy(() => import('./PolyvagalExercises.jsx'));
const IFSJournaling = lazy(() => import('./IFSJournaling.jsx'));
const MediaPipeMonitor = lazy(() => import('./MediaPipeMonitor.jsx'));

// Loading component for better UX during lazy loading
const LoadingSpinner = ({ message = "Loading..." }) => (
  <Card className="w-full">
    <CardContent className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </CardContent>
  </Card>
);

// Optimized lazy wrapper with error boundary
const LazyWrapper = ({ children, fallback, errorMessage = "Failed to load component" }) => (
  <Suspense fallback={fallback || <LoadingSpinner />}>
    <ErrorBoundary errorMessage={errorMessage}>
      {children}
    </ErrorBoundary>
  </Suspense>
);

// Simple error boundary for lazy components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="w-full border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Component Error
              </h3>
              <p className="text-red-600 mb-4">
                {this.props.errorMessage}
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Lazy component exports with optimized loading
export const LazyEnhancedWakeMode = React.memo((props) => (
  <LazyWrapper fallback={<LoadingSpinner message="Loading Wake Mode..." />}>
    <EnhancedWakeMode {...props} />
  </LazyWrapper>
));

export const LazyEnhancedSleepMode = React.memo((props) => (
  <LazyWrapper fallback={<LoadingSpinner message="Loading Sleep Mode..." />}>
    <EnhancedSleepMode {...props} />
  </LazyWrapper>
));

export const LazyFearPatternForm = React.memo((props) => (
  <LazyWrapper fallback={<LoadingSpinner message="Loading Fear Pattern Analysis..." />}>
    <FearPatternForm {...props} />
  </LazyWrapper>
));

export const LazySomaticExperiencing = React.memo((props) => (
  <LazyWrapper fallback={<LoadingSpinner message="Loading Somatic Exercises..." />}>
    <SomaticExperiencing {...props} />
  </LazyWrapper>
));

export const LazyPolyvagalExercises = React.memo((props) => (
  <LazyWrapper fallback={<LoadingSpinner message="Loading Polyvagal Exercises..." />}>
    <PolyvagalExercises {...props} />
  </LazyWrapper>
));

export const LazyIFSJournaling = React.memo((props) => (
  <LazyWrapper fallback={<LoadingSpinner message="Loading IFS Journaling..." />}>
    <IFSJournaling {...props} />
  </LazyWrapper>
));

export const LazyMediaPipeMonitor = React.memo((props) => (
  <LazyWrapper fallback={<LoadingSpinner message="Loading Safety Monitor..." />}>
    <MediaPipeMonitor {...props} />
  </LazyWrapper>
));

// Preload components for better performance
export const preloadComponents = () => {
  // Preload critical components
  import('./EnhancedWakeMode.jsx');
  import('./EnhancedSleepMode.jsx');
  
  // Preload other components after a delay
  setTimeout(() => {
    import('./FearPatternForm.jsx');
    import('./SomaticExperiencing.jsx');
    import('./PolyvagalExercises.jsx');
    import('./IFSJournaling.jsx');
    import('./MediaPipeMonitor.jsx');
  }, 2000);
};

export default {
  LazyEnhancedWakeMode,
  LazyEnhancedSleepMode,
  LazyFearPatternForm,
  LazySomaticExperiencing,
  LazyPolyvagalExercises,
  LazyIFSJournaling,
  LazyMediaPipeMonitor,
  preloadComponents
};

