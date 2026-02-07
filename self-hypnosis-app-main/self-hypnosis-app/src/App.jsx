import React, { useState, useEffect } from 'react';
import './App.css';

// Performance-optimized components
import ModeToggle, { ModeDescription } from './components/ModeToggle.jsx';
import DopamineChart from './components/DopamineChart.jsx';
import { 
  LazyEnhancedWakeMode, 
  LazyEnhancedSleepMode, 
  PerformanceMonitor,
  LazyComponentErrorBoundary
} from './components/LazyLoadedComponents.jsx';

// Hooks and utilities
import { useUserProfile } from './hooks/useLocalStorage.js';
import { performanceMonitor, AudioManager } from './utils/performanceOptimizer.js';
import { MODES, DEFAULT_USER_PROFILE } from './types.js';
import deepLinkHandler from './services/deepLinkHandler.js';
import dataSyncService from './services/dataSyncService.js';

/**
 * Main App component for the Self-Hypnosis Behavioral Rewiring App
 * Integrates Chase Hughes' methodology, CBT, hypnosis, Cartesian philosophy,
 * and additional corrective structures (Somatic Experiencing, Polyvagal Theory, IFS)
 * Now optimized for performance with lazy loading and monitoring
 */
function App() {
  const [mode, setMode] = useState(MODES.WAKE);
  const [showDopamineChart, setShowDopamineChart] = useState(false);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  
  // User profile management with localStorage persistence
  const userProfileActions = useUserProfile(DEFAULT_USER_PROFILE);
  const { userProfile } = userProfileActions;
  
  // Performance-optimized audio manager
  const audioManagerRef = React.useRef(null);
  
  // Initialize performance monitoring, audio management, and deep linking
  useEffect(() => {
    const startTime = performance.now();
    performanceMonitor.trackComponentRender('App', startTime);
    
    // Initialize audio manager
    audioManagerRef.current = new AudioManager(3); // Max 3 concurrent audio
    
    // Preload critical audio files
    const criticalAudio = [
      '/audio/expanded_sovereignty_core.wav',
      '/audio/expanded_inner_authority.wav',
      '/audio/expanded_authority_body_scan.wav'
    ];
    
    criticalAudio.forEach(url => {
      audioManagerRef.current.preloadAudio(url, 'high');
    });

    // Initialize deep link handler
    deepLinkHandler.initialize();
    
    // Initialize data sync service
    dataSyncService.initialize().catch(error => {
      console.warn('Data sync service initialization failed:', error);
    });

    // Set up deep link event listeners
    deepLinkHandler.addEventListener('app:open', () => {
      console.log('App opened via deep link');
    });

    deepLinkHandler.addEventListener('session:start', (sessionData) => {
      console.log('Session start requested:', sessionData);
      // Switch to appropriate mode based on session type
      if (['hypnosis', 'meditation'].includes(sessionData.type)) {
        setMode(MODES.SLEEP);
      } else {
        setMode(MODES.WAKE);
      }
    });

    deepLinkHandler.addEventListener('habit:track', (habitData) => {
      console.log('Habit tracking requested:', habitData);
      // Could trigger a notification or update UI
    });

    // Set up data sync listeners
    dataSyncService.addSyncListener('sync:completed', (result) => {
      console.log('Data sync completed:', result);
      // Could show a success notification
    });

    dataSyncService.addSyncListener('premium:updated', (data) => {
      console.log('Premium status updated:', data);
      // Update user profile with premium status
      userProfileActions.updateProfile({ isPremium: data.isPremium });
    });
    
    // Cleanup on unmount
    return () => {
      if (audioManagerRef.current) {
        audioManagerRef.current.cleanup();
      }
      deepLinkHandler.destroy();
      dataSyncService.destroy();
    };
  }, [userProfileActions]);

  const toggleMode = React.useCallback(() => {
    setMode(prevMode => prevMode === MODES.WAKE ? MODES.SLEEP : MODES.WAKE);
  }, []);

  return (
    <LazyComponentErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Self-Hypnosis Behavioral Rewiring
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A comprehensive therapeutic tool integrating Chase Hughes' methodology, CBT, hypnosis, 
                and advanced psychological frameworks for behavioral transformation.
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Dopamine Chart - Achievement Dashboard */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-foreground">Achievement Dashboard</h2>
              <button
                onClick={() => setShowDopamineChart(!showDopamineChart)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                {showDopamineChart ? 'Hide Dashboard' : 'Show Dashboard'}
              </button>
            </div>
            
            {showDopamineChart && (
              <div className="bg-card rounded-lg border p-6">
                {authToken ? (
                  <DopamineChart user={user} authToken={authToken} />
                ) : (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-2">Track Your Progress</h3>
                    <p className="text-muted-foreground mb-4">
                      Sign in to set goals, track achievements, and visualize your therapeutic journey.
                    </p>
                    <button
                      onClick={() => {
                        // For demo purposes, create a demo token
                        const demoToken = 'demo_token_' + Date.now();
                        setAuthToken(demoToken);
                        localStorage.setItem('authToken', demoToken);
                        setUser({ id: 1, email: 'demo@example.com' });
                      }}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Try Demo Dashboard
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mode Toggle */}
        <ModeToggle 
          mode={mode} 
          toggleMode={toggleMode}
          disabled={false}
        />

        {/* Mode Description */}
        <ModeDescription mode={mode} />

        {/* Mode Content */}
        <div className="mt-8">
          {mode === MODES.WAKE ? (
            <LazyEnhancedWakeMode 
              userProfile={userProfile}
              userProfileActions={userProfileActions}
            />
          ) : (
            <LazyEnhancedSleepMode 
              userProfile={userProfile}
              addSessionToHistory={userProfileActions.addSessionToHistory}
              updateProfile={userProfileActions.updateProfile}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-3">Therapeutic Approaches</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Chase Hughes' Behavioral Table of Elements</li>
                <li>• Cognitive Behavioral Therapy (CBT)</li>
                <li>• Somatic Experiencing (Peter Levine)</li>
                <li>• Polyvagal Theory (Stephen Porges)</li>
                <li>• Internal Family Systems (Richard Schwartz)</li>
                <li>• Cartesian Philosophical Inquiry</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Wake Mode Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Fear pattern identification</li>
                <li>• Somatic experiencing exercises</li>
                <li>• Polyvagal nervous system regulation</li>
                <li>• IFS journaling and self-exploration</li>
                <li>• CBT cognitive restructuring</li>
                <li>• Philosophical self-inquiry</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Sleep Mode Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Personalized subliminal affirmations</li>
                <li>• Delta wave deep sleep induction</li>
                <li>• Theta wave subconscious programming</li>
                <li>• Binaural beats for brainwave entrainment</li>
                <li>• Rife healing frequencies</li>
                <li>• Authority confidence programming</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              This app is designed for educational and self-help purposes. 
              For serious mental health concerns, please consult with a qualified professional.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Built with React, integrating evidence-based therapeutic methodologies.
            </p>
          </div>
        </div>
      </footer>
      
      {/* Performance Monitor */}
      <PerformanceMonitor />
    </div>
    </LazyComponentErrorBoundary>
  );
}

export default App;

