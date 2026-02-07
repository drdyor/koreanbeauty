import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Slider } from '@/components/ui/slider.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Moon, Play, Pause, Volume2, Timer, Waves, Brain, Square, Lightbulb } from 'lucide-react';
import apiService, { mockData } from '../services/api';
import LightFrequencyTherapy from './LightFrequencyTherapy.jsx';
import { expandedTherapeuticContent, getAllExpandedContent } from '../utils/expandedTherapeuticContent.js';

/**
 * Enhanced Sleep Mode component with backend API integration
 * Implements subconscious behavioral rewiring through audio entrainment
 */
export default function EnhancedSleepMode({ userProfile, addSessionToHistory, updateProfile }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(userProfile?.preferences?.audioVolume || 0.5);
  const [sessionDuration, setSessionDuration] = useState(userProfile?.preferences?.sessionDuration || 30);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [therapeuticContent, setTherapeuticContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const timerRef = useRef(null);

  // Load therapeutic content on component mount
  useEffect(() => {
    loadTherapeuticContent();
  }, []);

  const loadTherapeuticContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API, fallback to mock data
      let content;
      try {
        const response = await apiService.getTherapeuticContent({
          content_type: 'subliminal,affirmation,frequency'
        });
        content = response.content || response;
      } catch (apiError) {
        console.warn('API unavailable, using mock data:', apiError);
        content = mockData.therapeuticContent.filter(item => 
          ['subliminal', 'affirmation', 'frequency'].includes(item.content_type)
        );
      }
      
      setTherapeuticContent(content);
    } catch (err) {
      console.error('Error loading therapeutic content:', err);
      setError('Failed to load therapeutic content');
      // Use mock data as fallback
      setTherapeuticContent(mockData.therapeuticContent.filter(item => 
        ['subliminal', 'affirmation', 'frequency'].includes(item.content_type)
      ));
    } finally {
      setLoading(false);
    }
  };

  // Enhanced audio tracks with dynamic content and expanded library
  const getAudioTracks = () => {
    // Get expanded content
    const expandedContent = getAllExpandedContent();
    
    const tracks = [
      // Original tracks
      {
        id: 'personalized_affirmations',
        name: 'Personalized Affirmations',
        description: 'Subliminal affirmations based on your identified fear patterns',
        type: 'subliminal',
        frequency: null,
        duration: 'Custom',
        audioUrl: '/audio/authority_confidence_affirmations.wav',
        available: true,
        content: therapeuticContent.find(c => c.content_type === 'affirmation' && c.category === 'authority')
      },
      {
        id: 'sovereignty_activation',
        name: 'Sovereignty Activation',
        description: 'Deep programming for personal sovereignty and equality',
        type: 'subliminal',
        frequency: null,
        duration: '15 min',
        audioUrl: '/audio/sovereignty_activation.wav',
        available: true,
        content: therapeuticContent.find(c => c.content_type === 'affirmation' && c.category === 'sovereignty')
      },
      {
        id: 'theta_programming',
        name: 'Theta Programming',
        description: 'Deep belief change in theta brainwave state (4-8 Hz)',
        type: 'theta_wave',
        frequency: '6 Hz',
        duration: '30 min',
        audioUrl: '/audio/theta_programming.wav',
        available: true,
        content: therapeuticContent.find(c => c.content_type === 'subliminal')
      },
      {
        id: 'rife_frequency_healing',
        name: 'Rife Frequency Healing',
        description: 'Healing frequencies for emotional balance (528 Hz)',
        type: 'frequency',
        frequency: '528 Hz',
        duration: '20 min',
        audioUrl: '/audio/rife_frequency_healing.wav',
        available: true,
        content: therapeuticContent.find(c => c.content_type === 'frequency')
      },
      {
        id: 'somatic_body_scan',
        name: 'Somatic Body Scan',
        description: 'Guided body awareness for nervous system regulation',
        type: 'meditation',
        frequency: null,
        duration: '15 min',
        audioUrl: '/audio/somatic_body_scan.wav',
        available: true,
        content: therapeuticContent.find(c => c.category === 'somatic')
      },
      {
        id: 'polyvagal_safety',
        name: 'Polyvagal Safety',
        description: 'Nervous system safety and connection activation',
        type: 'meditation',
        frequency: null,
        duration: '12 min',
        audioUrl: '/audio/polyvagal_safety.wav',
        available: true,
        content: therapeuticContent.find(c => c.category === 'polyvagal')
      },
      
      // NEW EXPANDED CONTENT - 35% MORE
      // Authority Confidence Affirmations
      {
        id: 'core_sovereignty',
        name: 'Core Sovereignty Declarations',
        description: 'Fundamental affirmations for establishing personal sovereignty',
        type: 'affirmation',
        frequency: null,
        duration: '3 min',
        audioUrl: '/audio/expanded_sovereignty_core.wav',
        available: true,
        content: expandedContent.find(c => c.title === 'Core Sovereignty Declarations'),
        isNew: true
      },
      {
        id: 'inner_authority_activation',
        name: 'Inner Authority Activation',
        description: 'Activating your inner wisdom and authentic self-expression',
        type: 'affirmation',
        frequency: null,
        duration: '3 min',
        audioUrl: '/audio/expanded_inner_authority.wav',
        available: true,
        content: expandedContent.find(c => c.title === 'Inner Authority Activation'),
        isNew: true
      },
      
      // Advanced Somatic Exercises
      {
        id: 'authority_body_scan',
        name: 'Authority Trigger Body Scan',
        description: 'Body-based healing for authority-related tension and trauma',
        type: 'meditation',
        frequency: null,
        duration: '8 min',
        audioUrl: '/audio/expanded_authority_body_scan.wav',
        available: true,
        content: expandedContent.find(c => c.title === 'Authority Trigger Body Scan'),
        isNew: true
      },
      {
        id: 'nervous_system_pendulation',
        name: 'Nervous System Pendulation',
        description: 'Teaching your nervous system to move between activation and calm',
        type: 'meditation',
        frequency: null,
        duration: '10 min',
        audioUrl: '/audio/expanded_nervous_system_pendulation.wav',
        available: true,
        content: expandedContent.find(c => c.title === 'Nervous System Pendulation'),
        isNew: true
      },
      
      // Enhanced Polyvagal Applications
      {
        id: 'ventral_vagal_activation',
        name: 'Ventral Vagal Activation',
        description: 'Activating your social engagement system for confident interactions',
        type: 'meditation',
        frequency: null,
        duration: '8 min',
        audioUrl: '/audio/expanded_ventral_vagal_activation.wav',
        available: true,
        content: expandedContent.find(c => c.title === 'Ventral Vagal Activation for Authority Confidence'),
        isNew: true
      },
      
      // IFS Work
      {
        id: 'authority_fearful_part',
        name: 'Meeting Your Authority-Fearful Part',
        description: 'Connecting with and healing the part that fears authority',
        type: 'meditation',
        frequency: null,
        duration: '12 min',
        audioUrl: '/audio/expanded_ifs_authority_fearful.wav',
        available: true,
        content: expandedContent.find(c => c.title === 'Meeting Your Authority-Fearful Part'),
        isNew: true
      },
      
      // New Subliminal Tracks
      {
        id: 'deep_sovereignty_subliminal',
        name: 'Deep Sovereignty Programming',
        description: 'Subconscious programming for deep sovereignty and self-authority',
        type: 'subliminal',
        frequency: '6 Hz Theta',
        duration: '30 min',
        audioUrl: null, // Generated dynamically
        available: true,
        content: expandedContent.find(c => c.title === 'Deep Sovereignty Programming'),
        isNew: true
      },
      {
        id: 'authority_confidence_subliminal',
        name: 'Authority Confidence Subliminal',
        description: 'Building unconscious confidence in authority interactions',
        type: 'subliminal',
        frequency: '10 Hz Alpha',
        duration: '25 min',
        audioUrl: null, // Generated dynamically
        available: true,
        content: expandedContent.find(c => c.title === 'Authority Confidence Subliminal'),
        isNew: true
      },
      {
        id: 'fear_release_subliminal',
        name: 'Authority Fear Release',
        description: 'Deep subconscious release of authority-related fears',
        type: 'subliminal',
        frequency: '2 Hz Delta',
        duration: '20 min',
        audioUrl: null, // Generated dynamically
        available: true,
        content: expandedContent.find(c => c.title === 'Authority Fear Release'),
        isNew: true
      }
    ];

    return tracks.filter(track => track.available);
  };

  const playAudio = async (track) => {
    try {
      if (isPlaying && currentTrack?.id === track.id) {
        stopAudio();
        return;
      }

      stopAudio(); // Stop any currently playing audio
      
      setCurrentTrack(track);
      setIsPlaying(true);
      setTimeRemaining(sessionDuration * 60); // Convert to seconds
      setSessionProgress(0);

      // Try to play actual audio file first
      if (track.audioUrl) {
        try {
          audioRef.current = new Audio(track.audioUrl);
          audioRef.current.volume = volume;
          audioRef.current.loop = true;
          
          audioRef.current.addEventListener('canplaythrough', () => {
            audioRef.current.play().catch(console.error);
          });
          
          audioRef.current.addEventListener('error', () => {
            console.warn('Audio file not available, generating tone');
            generateTone(track);
          });
          
          audioRef.current.load();
        } catch (audioError) {
          console.warn('Audio playback failed, generating tone:', audioError);
          generateTone(track);
        }
      } else {
        generateTone(track);
      }

      // Start session timer
      startSessionTimer();

      // Log session start
      try {
        await apiService.createSession({
          user_id: userProfile?.id || 1,
          session_type: 'sleep_mode',
          module_used: track.id,
          duration_minutes: sessionDuration,
          completion_status: 'in_progress'
        });
      } catch (apiError) {
        console.warn('Failed to log session start:', apiError);
      }

    } catch (error) {
      console.error('Error playing audio:', error);
      setError('Failed to start audio session');
      setIsPlaying(false);
      setCurrentTrack(null);
    }
  };

  const generateTone = (track) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      oscillatorRef.current = audioContext.createOscillator();
      gainNodeRef.current = audioContext.createGain();

      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContext.destination);

      // Set frequency based on track type
      let frequency = 440; // Default A4
      if (track.frequency) {
        const freqMatch = track.frequency.match(/(\d+(?:\.\d+)?)/);
        if (freqMatch) {
          frequency = parseFloat(freqMatch[1]);
        }
      }

      oscillatorRef.current.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillatorRef.current.type = 'sine';
      gainNodeRef.current.gain.setValueAtTime(volume * 0.1, audioContext.currentTime); // Lower volume for tones

      oscillatorRef.current.start();
    } catch (error) {
      console.error('Error generating tone:', error);
    }
  };

  const stopAudio = () => {
    // Stop HTML5 audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    // Stop Web Audio API oscillator
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {
        // Oscillator might already be stopped
      }
      oscillatorRef.current = null;
    }

    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsPlaying(false);
    setCurrentTrack(null);
    setTimeRemaining(0);
    setSessionProgress(0);
  };

  const updateVolume = (newVolume) => {
    const volumeValue = newVolume[0];
    setVolume(volumeValue);

    // Update HTML5 audio volume
    if (audioRef.current) {
      audioRef.current.volume = volumeValue;
    }

    // Update Web Audio API gain
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volumeValue * 0.1, audioContextRef.current.currentTime);
    }
  };

  const startSessionTimer = () => {
    const totalSeconds = sessionDuration * 60;
    let elapsed = 0;

    timerRef.current = setInterval(() => {
      elapsed += 1;
      const remaining = totalSeconds - elapsed;
      
      if (remaining <= 0) {
        stopAudio();
        // Session completed
        addSessionToHistory?.({
          type: 'sleep_mode',
          module: currentTrack?.name || 'Unknown',
          duration: sessionDuration,
          completed: true,
          timestamp: new Date().toISOString()
        });
        return;
      }

      setTimeRemaining(remaining);
      setSessionProgress((elapsed / totalSeconds) * 100);
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTrackIcon = (type) => {
    switch (type) {
      case 'subliminal':
      case 'theta_wave':
        return <Brain className="h-4 w-4" />;
      case 'frequency':
        return <Waves className="h-4 w-4" />;
      case 'meditation':
        return <Moon className="h-4 w-4" />;
      default:
        return <Moon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Moon className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">Loading Sleep Mode...</h2>
          <p className="text-gray-600">Preparing your therapeutic audio content</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Moon className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-2xl font-bold mb-2">Sleep Mode</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadTherapeuticContent} variant="outline">
            Retry Loading Content
          </Button>
        </div>
      </div>
    );
  }

  const audioTracks = getAudioTracks();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Moon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
        <h2 className="text-2xl font-bold mb-2">Sleep Mode</h2>
        <p className="text-gray-600">
          Subconscious behavioral rewiring through subliminal audio programming
        </p>
      </div>

      {/* Session Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Session Settings
          </CardTitle>
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
              max={120}
              step={5}
              className="w-full"
              disabled={isPlaying}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Volume: {Math.round(volume * 100)}%
            </label>
            <Slider
              value={[volume]}
              onValueChange={updateVolume}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>

          {isPlaying && currentTrack && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Playing: {currentTrack.name}</span>
                <span>{formatTime(timeRemaining)}</span>
              </div>
              <Progress value={sessionProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Therapy Modes */}
      <Tabs defaultValue="audio" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Waves className="h-4 w-4" />
            Audio Therapy
          </TabsTrigger>
          <TabsTrigger value="light" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Light Frequency
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audio" className="space-y-4">
          {/* Audio Tracks */}
          <div className="grid gap-4 md:grid-cols-2">
            {audioTracks.map((track) => (
              <Card key={track.id} className={`cursor-pointer transition-all ${
                currentTrack?.id === track.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
              }`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      {getTrackIcon(track.type)}
                      {track.name}
                    </div>
                    <div className="flex gap-2">
                      {track.isNew && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          NEW
                        </Badge>
                      )}
                      {track.frequency && (
                        <Badge variant="secondary" className="text-xs">
                          {track.frequency}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {track.duration}
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription>{track.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {track.content && (
                    <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                      <strong>Content Preview:</strong> {track.content.content?.substring(0, 100)}...
                    </div>
                  )}
                  <Button
                    onClick={() => playAudio(track)}
                    className="w-full"
                    variant={currentTrack?.id === track.id && isPlaying ? "destructive" : "default"}
                  >
                    {currentTrack?.id === track.id && isPlaying ? (
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="light" className="space-y-4">
          {/* Light Frequency Therapy */}
          <LightFrequencyTherapy
            userProfile={userProfile}
            onSessionComplete={(sessionData) => {
              addSessionToHistory?.(sessionData);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Safety Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-amber-600 mt-1">⚠️</div>
            <div className="text-sm text-amber-800">
              <strong>Safety Notice:</strong> Sleep mode audio is designed for relaxation and subconscious programming. 
              Use comfortable headphones at low volume. Discontinue if you experience any discomfort. 
              This is not a substitute for professional medical or psychological treatment.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

