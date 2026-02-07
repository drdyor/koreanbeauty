import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Slider } from '@/components/ui/slider.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { Moon, Play, Pause, Volume2, Timer, Waves, Brain } from 'lucide-react';
import { getAffirmationsForPatterns } from '../utils/fearPatterns.js';
import { AUDIO_TYPES } from '../types.js';

/**
 * Sleep Mode component for subliminal audio programming and frequency therapy
 * Implements subconscious behavioral rewiring through audio entrainment
 */
export default function SleepMode({ userProfile, addSessionToHistory, updateProfile }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(userProfile.preferences?.audioVolume || 0.5);
  const [sessionDuration, setSessionDuration] = useState(userProfile.preferences?.sessionDuration || 30);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionProgress, setSessionProgress] = useState(0);
  
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const timerRef = useRef(null);

  const audioTracks = [
    {
      id: 'personalized_affirmations',
      name: 'Personalized Affirmations',
      description: 'Subliminal affirmations based on your identified fear patterns',
      type: AUDIO_TYPES.SUBLIMINAL,
      frequency: null,
      duration: 'Custom',
      audioUrl: '/audio/authority_confidence_affirmations.wav',
      available: userProfile.fearPatterns && userProfile.fearPatterns.length > 0
    },
    {
      id: 'delta_wave_deep_sleep',
      name: 'Delta Wave Deep Sleep',
      description: 'Deep sleep induction with delta waves (0.5-4 Hz)',
      type: AUDIO_TYPES.DELTA_WAVE,
      frequency: '2 Hz',
      duration: '60 min',
      audioUrl: '/audio/theta_programming.wav',
      available: true
    },
    {
      id: 'theta_programming',
      name: 'Theta Programming',
      description: 'Subconscious programming with theta waves (4-8 Hz)',
      type: AUDIO_TYPES.THETA_WAVE,
      frequency: '6 Hz',
      duration: '45 min',
      audioUrl: '/audio/theta_programming.wav',
      available: true
    },
    {
      id: 'authority_confidence',
      name: 'Authority Confidence',
      description: 'Specific programming for confidence with authority figures',
      type: AUDIO_TYPES.SUBLIMINAL,
      frequency: '40 Hz (Gamma)',
      duration: '30 min',
      audioUrl: '/audio/authority_confidence_affirmations.wav',
      available: true
    },
    {
      id: 'sovereignty_activation',
      name: 'Sovereignty Activation',
      description: 'Activate your inherent sovereignty and self-worth',
      type: AUDIO_TYPES.SUBLIMINAL,
      frequency: '10 Hz (Alpha)',
      duration: '25 min',
      audioUrl: '/audio/sovereignty_activation.wav',
      available: true
    },
    {
      id: 'rife_frequency_healing',
      name: 'Rife Frequency Healing',
      description: 'Healing frequencies for emotional balance',
      type: AUDIO_TYPES.RIFE_FREQUENCY,
      frequency: '528 Hz',
      duration: '20 min',
      audioUrl: '/audio/rife_frequency_healing.wav',
      available: true
    }
  ];

  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          const totalTime = sessionDuration * 60;
          setSessionProgress(((totalTime - newTime) / totalTime) * 100);
          
          if (newTime <= 0) {
            stopAudio();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isPlaying, timeRemaining, sessionDuration]);

  const initializeAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const generateBinauralBeat = (frequency) => {
    const audioContext = initializeAudioContext();
    
    // Create oscillators for binaural beat
    const leftOscillator = audioContext.createOscillator();
    const rightOscillator = audioContext.createOscillator();
    
    // Create gain nodes
    const leftGain = audioContext.createGain();
    const rightGain = audioContext.createGain();
    const masterGain = audioContext.createGain();
    
    // Set frequencies (binaural beat = difference between left and right)
    leftOscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    rightOscillator.frequency.setValueAtTime(200 + frequency, audioContext.currentTime);
    
    // Set volume
    leftGain.gain.setValueAtTime(volume * 0.1, audioContext.currentTime); // Very low volume for subliminal
    rightGain.gain.setValueAtTime(volume * 0.1, audioContext.currentTime);
    masterGain.gain.setValueAtTime(volume, audioContext.currentTime);
    
    // Create stereo panner for left/right separation
    const leftPanner = audioContext.createStereoPanner();
    const rightPanner = audioContext.createStereoPanner();
    leftPanner.pan.setValueAtTime(-1, audioContext.currentTime);
    rightPanner.pan.setValueAtTime(1, audioContext.currentTime);
    
    // Connect the audio graph
    leftOscillator.connect(leftGain);
    rightOscillator.connect(rightGain);
    leftGain.connect(leftPanner);
    rightGain.connect(rightPanner);
    leftPanner.connect(masterGain);
    rightPanner.connect(masterGain);
    masterGain.connect(audioContext.destination);
    
    // Store references
    oscillatorRef.current = { left: leftOscillator, right: rightOscillator };
    gainNodeRef.current = masterGain;
    
    // Start oscillators
    leftOscillator.start();
    rightOscillator.start();
  };

  const playAudio = (track) => {
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    setCurrentTrack(track);
    setTimeRemaining(sessionDuration * 60);
    setSessionProgress(0);
    setIsPlaying(true);

    // Play the actual audio file if available
    if (track.audioUrl) {
      const audio = new Audio(track.audioUrl);
      audio.volume = volume;
      audio.loop = true; // Loop the audio for the session duration
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        // Fallback to generated tones if audio file fails
        generateBinauralBeat(getFrequencyForTrack(track));
      });
      
      // Store audio reference for volume control
      audioContextRef.current = { audioElement: audio };
    } else {
      // Fallback to generated tones
      generateBinauralBeat(getFrequencyForTrack(track));
    }
  };

  const getFrequencyForTrack = (track) => {
    switch (track.type) {
      case AUDIO_TYPES.DELTA_WAVE:
        return 2; // 2 Hz delta wave
      case AUDIO_TYPES.THETA_WAVE:
        return 6; // 6 Hz theta wave
      case AUDIO_TYPES.SUBLIMINAL:
        return 10; // 10 Hz alpha wave as carrier
      case AUDIO_TYPES.RIFE_FREQUENCY:
        return 528; // 528 Hz healing frequency
      default:
        return 10; // Default alpha wave
    }
  };

  const stopAudio = () => {
    // Stop audio element if it exists
    if (audioContextRef.current?.audioElement) {
      audioContextRef.current.audioElement.pause();
      audioContextRef.current.audioElement.currentTime = 0;
    }

    // Stop oscillators if they exist
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.left.stop();
        oscillatorRef.current.right.stop();
      } catch (e) {
        // Oscillators may already be stopped
      }
      oscillatorRef.current = null;
    }

    if (currentTrack) {
      const sessionData = {
        type: 'sleep_mode_session',
        track: currentTrack.name,
        audioType: currentTrack.type,
        duration: Math.round((sessionDuration * 60 - timeRemaining) / 60),
        completionPercentage: sessionProgress,
        volume: volume
      };
      addSessionToHistory(sessionData);
    }

    setIsPlaying(false);
    setCurrentTrack(null);
    setTimeRemaining(0);
    setSessionProgress(0);
    clearInterval(timerRef.current);
  };

  const updateVolume = (newVolume) => {
    setVolume(newVolume[0]);
    updateProfile({ 
      preferences: { 
        ...userProfile.preferences, 
        audioVolume: newVolume[0] 
      } 
    });
    
    // Update volume for audio element
    if (audioContextRef.current?.audioElement) {
      audioContextRef.current.audioElement.volume = newVolume[0];
    }
    
    // Update volume for oscillators
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVolume[0], audioContextRef.current.currentTime);
    }
  };

  const updateSessionDuration = (newDuration) => {
    setSessionDuration(newDuration[0]);
    updateProfile({ 
      preferences: { 
        ...userProfile.preferences, 
        sessionDuration: newDuration[0] 
      } 
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPersonalizedAffirmations = () => {
    if (!userProfile.fearPatterns || userProfile.fearPatterns.length === 0) {
      return [];
    }
    return getAffirmationsForPatterns(userProfile.fearPatterns);
  };

  const renderTrackSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {audioTracks.map(track => {
        const isPersonalized = track.id === 'personalized_affirmations';
        const affirmations = isPersonalized ? getPersonalizedAffirmations() : [];
        
        return (
          <Card 
            key={track.id} 
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              !track.available ? 'opacity-50' : ''
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {track.type === AUDIO_TYPES.SUBLIMINAL && <Brain className="h-5 w-5 text-purple-500" />}
                {track.type === AUDIO_TYPES.DELTA_WAVE && <Moon className="h-5 w-5 text-blue-500" />}
                {track.type === AUDIO_TYPES.THETA_WAVE && <Waves className="h-5 w-5 text-green-500" />}
                {track.type === AUDIO_TYPES.RIFE_FREQUENCY && <Timer className="h-5 w-5 text-orange-500" />}
                <span>{track.name}</span>
              </CardTitle>
              <CardDescription>{track.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Badge variant="outline">{track.duration}</Badge>
                    {track.frequency && (
                      <Badge variant="secondary">{track.frequency}</Badge>
                    )}
                  </div>
                  <Button 
                    onClick={() => playAudio(track)}
                    disabled={!track.available || isPlaying}
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </Button>
                </div>
                
                {isPersonalized && affirmations.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Your affirmations:</p>
                    <ul className="space-y-1">
                      {affirmations.slice(0, 3).map((affirmation, index) => (
                        <li key={index}>• {affirmation}</li>
                      ))}
                      {affirmations.length > 3 && (
                        <li>• And {affirmations.length - 3} more...</li>
                      )}
                    </ul>
                  </div>
                )}
                
                {!track.available && (
                  <p className="text-xs text-muted-foreground">
                    Complete fear pattern analysis to unlock this track
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderActiveSession = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Moon className="h-5 w-5 text-blue-500" />
          <span>Active Session: {currentTrack.name}</span>
        </CardTitle>
        <CardDescription>{currentTrack.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-3xl font-mono font-bold mb-2">
              {formatTime(timeRemaining)}
            </div>
            <Progress value={sessionProgress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              {Math.round(sessionProgress)}% complete
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <Button onClick={stopAudio} variant="outline">
              <Pause className="h-4 w-4 mr-2" />
              Stop Session
            </Button>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Session Guidelines:</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Find a comfortable position and close your eyes</li>
              <li>• Use headphones for optimal binaural beat effect</li>
              <li>• Allow yourself to relax and let go</li>
              <li>• The audio will work on a subconscious level</li>
              <li>• You may fall asleep - this is perfectly fine</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderControls = () => (
    <Card>
      <CardHeader>
        <CardTitle>Audio Settings</CardTitle>
        <CardDescription>Customize your sleep mode experience</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Volume2 className="h-4 w-4" />
              <label className="text-sm font-medium">Volume: {Math.round(volume * 100)}%</label>
            </div>
            <Slider
              value={[volume]}
              onValueChange={updateVolume}
              max={1}
              min={0}
              step={0.1}
              disabled={isPlaying}
            />
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Timer className="h-4 w-4" />
              <label className="text-sm font-medium">Session Duration: {sessionDuration} minutes</label>
            </div>
            <Slider
              value={[sessionDuration]}
              onValueChange={updateSessionDuration}
              max={120}
              min={5}
              step={5}
              disabled={isPlaying}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Moon className="h-6 w-6 text-blue-500" />
            <span>Sleep Mode - Subconscious Programming</span>
          </CardTitle>
          <CardDescription>
            Utilize subliminal audio programming and frequency therapy to rewire patterns at the subconscious level.
            Best used during rest, meditation, or sleep.
          </CardDescription>
        </CardHeader>
      </Card>

      {!isPlaying ? (
        <>
          {renderControls()}
          {renderTrackSelection()}
        </>
      ) : (
        renderActiveSession()
      )}
    </div>
  );
}

