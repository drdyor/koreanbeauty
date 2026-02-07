import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Slider } from '@/components/ui/slider.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { 
  Lightbulb, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Brain, 
  Heart, 
  Moon, 
  Sun,
  Zap,
  Info
} from 'lucide-react';
import LightFrequencyEngine, { TherapeuticPatterns, globalPatternManager } from '../utils/lightFrequencyEngine.js';

/**
 * Light Frequency Therapy Component
 * Provides therapeutic light frequencies for brainwave entrainment and healing
 */
export default function LightFrequencyTherapy({ 
  userProfile, 
  onSessionComplete,
  className = "",
  embedded = false 
}) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const sessionTimerRef = useRef(null);
  
  const [isActive, setIsActive] = useState(false);
  const [currentPattern, setCurrentPattern] = useState(TherapeuticPatterns.ALPHA_RELAXATION);
  const [intensity, setIntensity] = useState(0.7);
  const [sessionDuration, setSessionDuration] = useState(10); // minutes
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [memoryStats, setMemoryStats] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 300 });

  // Pattern categories for better organization
  const patternCategories = {
    brainwave: {
      name: 'Brainwave Entrainment',
      icon: <Brain className="h-4 w-4" />,
      patterns: [
        TherapeuticPatterns.ALPHA_RELAXATION,
        TherapeuticPatterns.THETA_MEDITATION,
        TherapeuticPatterns.DELTA_SLEEP,
        TherapeuticPatterns.BETA_FOCUS,
        TherapeuticPatterns.GAMMA_AWARENESS
      ]
    },
    therapeutic: {
      name: 'Therapeutic Frequencies',
      icon: <Heart className="h-4 w-4" />,
      patterns: [
        TherapeuticPatterns.ANXIETY_RELIEF,
        TherapeuticPatterns.CONFIDENCE_BOOST,
        TherapeuticPatterns.AUTHORITY_BALANCE
      ]
    },
    solfeggio: {
      name: 'Solfeggio Healing',
      icon: <Zap className="h-4 w-4" />,
      patterns: [
        TherapeuticPatterns.LIBERATION_FROM_FEAR,
        TherapeuticPatterns.LOVE_AND_HEALING,
        TherapeuticPatterns.AWAKENING_INTUITION
      ]
    },
    natural: {
      name: 'Natural Frequencies',
      icon: <Sun className="h-4 w-4" />,
      patterns: [
        TherapeuticPatterns.SCHUMANN_RESONANCE
      ]
    }
  };

  // Pattern descriptions for user education
  const patternDescriptions = {
    [TherapeuticPatterns.ALPHA_RELAXATION]: {
      name: 'Alpha Relaxation',
      frequency: '8-13 Hz',
      description: 'Promotes relaxation, reduces anxiety, and enhances creativity',
      benefits: ['Stress reduction', 'Enhanced creativity', 'Improved focus'],
      duration: '10-20 minutes'
    },
    [TherapeuticPatterns.THETA_MEDITATION]: {
      name: 'Theta Meditation',
      frequency: '4-8 Hz',
      description: 'Deep meditative state, enhanced intuition and memory',
      benefits: ['Deep meditation', 'Enhanced intuition', 'Memory consolidation'],
      duration: '15-30 minutes'
    },
    [TherapeuticPatterns.DELTA_SLEEP]: {
      name: 'Delta Sleep',
      frequency: '0.5-4 Hz',
      description: 'Deep sleep induction and healing regeneration',
      benefits: ['Deep sleep', 'Physical healing', 'Growth hormone release'],
      duration: '30-60 minutes'
    },
    [TherapeuticPatterns.BETA_FOCUS]: {
      name: 'Beta Focus',
      frequency: '13-30 Hz',
      description: 'Enhanced concentration and analytical thinking',
      benefits: ['Improved focus', 'Analytical thinking', 'Problem solving'],
      duration: '15-45 minutes'
    },
    [TherapeuticPatterns.GAMMA_AWARENESS]: {
      name: 'Gamma Awareness',
      frequency: '30-100 Hz',
      description: 'Higher consciousness and peak mental performance',
      benefits: ['Peak awareness', 'Enhanced cognition', 'Spiritual insights'],
      duration: '10-20 minutes'
    },
    [TherapeuticPatterns.ANXIETY_RELIEF]: {
      name: 'Anxiety Relief',
      frequency: '8.5 Hz',
      description: 'Specifically tuned for anxiety and stress reduction',
      benefits: ['Anxiety reduction', 'Stress relief', 'Emotional balance'],
      duration: '15-25 minutes'
    },
    [TherapeuticPatterns.CONFIDENCE_BOOST]: {
      name: 'Confidence Boost',
      frequency: '12 Hz',
      description: 'Enhances self-confidence and personal power',
      benefits: ['Increased confidence', 'Personal empowerment', 'Self-esteem'],
      duration: '10-20 minutes'
    },
    [TherapeuticPatterns.AUTHORITY_BALANCE]: {
      name: 'Authority Balance',
      frequency: '9.5 Hz',
      description: 'Balances relationship with authority figures',
      benefits: ['Authority confidence', 'Balanced sovereignty', 'Respectful assertiveness'],
      duration: '15-25 minutes'
    },
    [TherapeuticPatterns.SCHUMANN_RESONANCE]: {
      name: 'Schumann Resonance',
      frequency: '7.83 Hz',
      description: 'Earth\'s natural frequency for grounding and balance',
      benefits: ['Natural grounding', 'Electromagnetic balance', 'Earth connection'],
      duration: '20-30 minutes'
    },
    [TherapeuticPatterns.LIBERATION_FROM_FEAR]: {
      name: 'Liberation from Fear',
      frequency: '396 Hz',
      description: 'Solfeggio frequency for releasing fear and guilt',
      benefits: ['Fear release', 'Guilt liberation', 'Emotional freedom'],
      duration: '20-30 minutes'
    },
    [TherapeuticPatterns.LOVE_AND_HEALING]: {
      name: 'Love and Healing',
      frequency: '528 Hz',
      description: 'The "Love Frequency" for DNA repair and transformation',
      benefits: ['DNA repair', 'Love resonance', 'Cellular healing'],
      duration: '20-40 minutes'
    },
    [TherapeuticPatterns.AWAKENING_INTUITION]: {
      name: 'Awakening Intuition',
      frequency: '741 Hz',
      description: 'Enhances intuition and spiritual awakening',
      benefits: ['Enhanced intuition', 'Spiritual awakening', 'Inner wisdom'],
      duration: '15-30 minutes'
    }
  };

  // Initialize engine when component mounts
  useEffect(() => {
    if (canvasRef.current && !engineRef.current) {
      try {
        // Set canvas ID for engine management
        const canvasId = `light-frequency-${Date.now()}`;
        canvasRef.current.id = canvasId;
        
        // Set canvas size
        canvasRef.current.width = canvasSize.width;
        canvasRef.current.height = canvasSize.height;
        
        // Create engine
        engineRef.current = globalPatternManager.createEngine(canvasId);
        
        // Update memory stats
        updateMemoryStats();
      } catch (error) {
        console.error('Failed to initialize light frequency engine:', error);
      }
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.cleanup();
        engineRef.current = null;
      }
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [canvasSize]);

  const updateMemoryStats = useCallback(() => {
    if (showAdvanced) {
      const stats = globalPatternManager.getMemoryStats();
      setMemoryStats(stats);
    }
  }, [showAdvanced]);

  const startSession = useCallback(() => {
    if (!engineRef.current) return;

    try {
      // Start light frequency
      engineRef.current.setPattern(currentPattern);
      engineRef.current.setIntensity(intensity);
      engineRef.current.start(currentPattern);
      
      setIsActive(true);
      setTimeRemaining(sessionDuration * 60);
      setSessionProgress(0);
      
      // Start session timer
      const totalSeconds = sessionDuration * 60;
      let elapsed = 0;
      
      sessionTimerRef.current = setInterval(() => {
        elapsed += 1;
        const remaining = totalSeconds - elapsed;
        
        if (remaining <= 0) {
          stopSession(true);
          return;
        }
        
        setTimeRemaining(remaining);
        setSessionProgress((elapsed / totalSeconds) * 100);
      }, 1000);
      
      updateMemoryStats();
    } catch (error) {
      console.error('Failed to start light frequency session:', error);
    }
  }, [currentPattern, intensity, sessionDuration, updateMemoryStats]);

  const stopSession = useCallback((completed = false) => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    
    setIsActive(false);
    setTimeRemaining(0);
    setSessionProgress(0);
    
    if (completed && onSessionComplete) {
      const patternInfo = patternDescriptions[currentPattern];
      onSessionComplete({
        type: 'light_frequency',
        pattern: currentPattern,
        patternName: patternInfo?.name || currentPattern,
        duration: sessionDuration,
        intensity: intensity,
        completed: true,
        timestamp: new Date().toISOString()
      });
    }
    
    updateMemoryStats();
  }, [currentPattern, sessionDuration, intensity, onSessionComplete, updateMemoryStats]);

  const handlePatternChange = useCallback((newPattern) => {
    setCurrentPattern(newPattern);
    
    if (isActive && engineRef.current) {
      engineRef.current.setPattern(newPattern);
    }
  }, [isActive]);

  const handleIntensityChange = useCallback((newIntensity) => {
    const intensityValue = newIntensity[0];
    setIntensity(intensityValue);
    
    if (isActive && engineRef.current) {
      engineRef.current.setIntensity(intensityValue);
    }
  }, [isActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentPatternInfo = () => {
    return patternDescriptions[currentPattern] || {};
  };

  const getPatternIcon = (category) => {
    return patternCategories[category]?.icon || <Lightbulb className="h-4 w-4" />;
  };

  if (embedded) {
    return (
      <div className={`space-y-4 ${className}`}>
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg border"
          style={{ maxHeight: '200px' }}
        />
        <div className="flex items-center justify-between">
          <Button
            onClick={isActive ? stopSession : startSession}
            variant={isActive ? "destructive" : "default"}
            size="sm"
          >
            {isActive ? <Square className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isActive ? 'Stop' : 'Start'} Light Therapy
          </Button>
          {isActive && (
            <div className="text-sm text-muted-foreground">
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentPatternInfo = getCurrentPatternInfo();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <Lightbulb className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
        <h2 className="text-2xl font-bold mb-2">Light Frequency Therapy</h2>
        <p className="text-muted-foreground">
          Therapeutic light frequencies for brainwave entrainment and healing
        </p>
      </div>

      {/* Main Canvas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Light Frequency Display
            </div>
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Visual representation of therapeutic light frequencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <canvas
            ref={canvasRef}
            className="w-full rounded-lg border bg-black"
            style={{ aspectRatio: '4/3' }}
          />
          
          {isActive && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Session Progress</span>
                <span>{formatTime(timeRemaining)}</span>
              </div>
              <Progress value={sessionProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pattern Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Pattern Selection</CardTitle>
          <CardDescription>
            Choose a therapeutic frequency pattern based on your needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(patternCategories).map(([categoryKey, category]) => (
              <div key={categoryKey} className="space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  {category.icon}
                  {category.name}
                </div>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {category.patterns.map((pattern) => {
                    const info = patternDescriptions[pattern];
                    return (
                      <Button
                        key={pattern}
                        variant={currentPattern === pattern ? "default" : "outline"}
                        className="justify-start h-auto p-3"
                        onClick={() => handlePatternChange(pattern)}
                        disabled={isActive}
                      >
                        <div className="text-left">
                          <div className="font-medium">{info?.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {info?.frequency}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Pattern Info */}
      {currentPatternInfo.name && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {currentPatternInfo.name}
            </CardTitle>
            <CardDescription>
              {currentPatternInfo.frequency} • {currentPatternInfo.duration}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{currentPatternInfo.description}</p>
            
            <div>
              <h4 className="font-medium mb-2">Benefits:</h4>
              <div className="flex flex-wrap gap-2">
                {currentPatternInfo.benefits?.map((benefit, index) => (
                  <Badge key={index} variant="secondary">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Session Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Session Duration: {sessionDuration} minutes
            </label>
            <Slider
              value={[sessionDuration]}
              onValueChange={(value) => setSessionDuration(value[0])}
              min={5}
              max={60}
              step={5}
              className="w-full"
              disabled={isActive}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Intensity: {Math.round(intensity * 100)}%
            </label>
            <Slider
              value={[intensity]}
              onValueChange={handleIntensityChange}
              min={0.1}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={isActive ? stopSession : startSession}
              className="flex-1"
              variant={isActive ? "destructive" : "default"}
            >
              {isActive ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Stop Session
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Session
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Advanced Settings
            </div>
            <Switch
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
            />
          </CardTitle>
        </CardHeader>
        {showAdvanced && (
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Canvas Size
              </label>
              <Select
                value={`${canvasSize.width}x${canvasSize.height}`}
                onValueChange={(value) => {
                  const [width, height] = value.split('x').map(Number);
                  setCanvasSize({ width, height });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="400x300">400x300 (Low Memory)</SelectItem>
                  <SelectItem value="600x450">600x450 (Medium)</SelectItem>
                  <SelectItem value="800x600">800x600 (High Quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {memoryStats && (
              <div className="space-y-2">
                <h4 className="font-medium">Memory Statistics</h4>
                <div className="text-sm space-y-1">
                  <div>Active Engines: {memoryStats.activeEngines}/{memoryStats.maxEngines}</div>
                  <div>WebGL Supported: {memoryStats.engines[canvasRef.current?.id]?.webglSupported ? 'Yes' : 'No'}</div>
                  <div>Using Canvas 2D: {memoryStats.engines[canvasRef.current?.id]?.usingCanvas2D ? 'Yes' : 'No'}</div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Safety Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-amber-600 mt-1">⚠️</div>
            <div className="text-sm text-amber-800">
              <strong>Safety Notice:</strong> Light frequency therapy may trigger photosensitive epilepsy in susceptible individuals. 
              Discontinue use if you experience dizziness, nausea, or discomfort. 
              Consult a healthcare provider if you have a history of seizures or photosensitivity.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

