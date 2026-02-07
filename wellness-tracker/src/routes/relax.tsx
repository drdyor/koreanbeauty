import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Moon,
  Brain,
  Zap,
  Focus,
  Headphones,
  ChevronLeft,
  Clock,
  Sparkles,
  Heart,
  Shield,
  Leaf,
  Sun,
  Music,
  SkipForward,
  SkipBack,
} from 'lucide-react';

export const Route = createFileRoute('/relax')({
  component: RelaxPage,
});

// Brain wave frequencies for binaural beats
const brainStates = [
  {
    id: 'delta',
    name: 'Delta',
    frequency: 2,
    baseFrequency: 200,
    icon: Moon,
    description: 'Deep sleep & healing',
    color: 'from-indigo-400 to-purple-500',
  },
  {
    id: 'theta',
    name: 'Theta',
    frequency: 6,
    baseFrequency: 200,
    icon: Brain,
    description: 'Relaxation & creativity',
    color: 'from-purple-400 to-pink-500',
  },
  {
    id: 'alpha',
    name: 'Alpha',
    frequency: 10,
    baseFrequency: 200,
    icon: Focus,
    description: 'Calm focus & learning',
    color: 'from-pink-400 to-rose-500',
  },
  {
    id: 'beta',
    name: 'Beta',
    frequency: 20,
    baseFrequency: 200,
    icon: Zap,
    description: 'Alert & concentration',
    color: 'from-amber-400 to-orange-500',
  },
];

// Hypnosis tracks with actual audio files
const hypnosisTracks = [
  {
    id: 'grounding',
    name: 'Grounding Meditation',
    description: 'Center yourself and feel present',
    duration: '3:30',
    file: '/audio/grounding_meditation.wav',
    icon: Leaf,
    category: 'Relaxation',
    color: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'body-scan',
    name: 'Somatic Body Scan',
    description: 'Release tension from your body',
    duration: '5:30',
    file: '/audio/somatic_body_scan.wav',
    icon: Heart,
    category: 'Body',
    color: 'from-pink-400 to-rose-500',
  },
  {
    id: 'self-worth',
    name: 'Self Worth Affirmations',
    description: 'Boost your confidence and self-love',
    duration: '2:40',
    file: '/audio/self_worth_affirmations.wav',
    icon: Sun,
    category: 'Affirmations',
    color: 'from-amber-400 to-orange-500',
  },
  {
    id: 'inner-child',
    name: 'Inner Child Healing',
    description: 'Nurture your inner child with love',
    duration: '2:15',
    file: '/audio/inner_child_affirmations.wav',
    icon: Heart,
    category: 'Healing',
    color: 'from-purple-400 to-pink-500',
  },
  {
    id: 'future-self',
    name: 'Future Self Visualization',
    description: 'Connect with your best future self',
    duration: '3:10',
    file: '/audio/future_self_visualization.wav',
    icon: Sparkles,
    category: 'Visualization',
    color: 'from-violet-400 to-purple-500',
  },
  {
    id: 'sovereignty',
    name: 'Sovereignty Activation',
    description: 'Reclaim your personal power',
    duration: '3:20',
    file: '/audio/sovereignty_activation.wav',
    icon: Shield,
    category: 'Empowerment',
    color: 'from-indigo-400 to-blue-500',
  },
  {
    id: 'theta',
    name: 'Theta Programming',
    description: 'Deep subconscious reprogramming',
    duration: '5:20',
    file: '/audio/theta_programming.wav',
    icon: Brain,
    category: 'Deep Work',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'polyvagal',
    name: 'Polyvagal Safety',
    description: 'Activate your nervous system safety',
    duration: '4:30',
    file: '/audio/polyvagal_safety.wav',
    icon: Shield,
    category: 'Nervous System',
    color: 'from-teal-400 to-cyan-500',
  },
  {
    id: 'abundance',
    name: 'Abundance Affirmations',
    description: 'Open yourself to prosperity',
    duration: '2:50',
    file: '/audio/abundance_affirmations.wav',
    icon: Sun,
    category: 'Manifestation',
    color: 'from-yellow-400 to-amber-500',
  },
  {
    id: 'rife',
    name: 'Rife Frequency Healing',
    description: 'Healing frequencies for wellbeing',
    duration: '3:40',
    file: '/audio/rife_frequency_healing.wav',
    icon: Music,
    category: 'Frequencies',
    color: 'from-cyan-400 to-blue-500',
  },
];

type TabType = 'binaural' | 'hypnosis';

function RelaxPage() {
  const [activeTab, setActiveTab] = useState<TabType>('hypnosis');
  const [selectedState, setSelectedState] = useState(brainStates[0]);
  const [selectedTrack, setSelectedTrack] = useState(hypnosisTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showHeadphoneWarning, setShowHeadphoneWarning] = useState(true);

  // Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorLeftRef = useRef<OscillatorNode | null>(null);
  const oscillatorRightRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize audio element for hypnosis tracks
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener('loadedmetadata', () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    });
    audioRef.current.addEventListener('timeupdate', () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    });
    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Load track when selected
  useEffect(() => {
    if (audioRef.current && activeTab === 'hypnosis') {
      const wasPlaying = isPlaying;
      audioRef.current.pause();
      audioRef.current.src = selectedTrack.file;
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current.play();
      }
    }
  }, [selectedTrack]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume * 0.3;
    }
  }, [volume, isMuted]);

  // Start binaural beats
  const startBinaural = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    const gainNode = ctx.createGain();
    gainNode.gain.value = isMuted ? 0 : volume * 0.3;
    gainNodeRef.current = gainNode;

    const pannerLeft = ctx.createStereoPanner();
    pannerLeft.pan.value = -1;
    const pannerRight = ctx.createStereoPanner();
    pannerRight.pan.value = 1;

    const oscLeft = ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.value = selectedState.baseFrequency;
    oscillatorLeftRef.current = oscLeft;

    const oscRight = ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.value = selectedState.baseFrequency + selectedState.frequency;
    oscillatorRightRef.current = oscRight;

    oscLeft.connect(pannerLeft);
    pannerLeft.connect(gainNode);
    oscRight.connect(pannerRight);
    pannerRight.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscLeft.start();
    oscRight.start();
  };

  // Stop binaural beats
  const stopBinaural = () => {
    if (oscillatorLeftRef.current) {
      oscillatorLeftRef.current.stop();
      oscillatorLeftRef.current = null;
    }
    if (oscillatorRightRef.current) {
      oscillatorRightRef.current.stop();
      oscillatorRightRef.current = null;
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (activeTab === 'hypnosis') {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    } else {
      if (isPlaying) {
        stopBinaural();
      } else {
        startBinaural();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Stop everything when switching tabs
  useEffect(() => {
    if (audioRef.current) audioRef.current.pause();
    stopBinaural();
    setIsPlaying(false);
    setCurrentTime(0);
  }, [activeTab]);

  // Update binaural frequencies
  useEffect(() => {
    if (isPlaying && activeTab === 'binaural' && oscillatorLeftRef.current && oscillatorRightRef.current) {
      oscillatorLeftRef.current.frequency.value = selectedState.baseFrequency;
      oscillatorRightRef.current.frequency.value = selectedState.baseFrequency + selectedState.frequency;
    }
  }, [selectedState, isPlaying, activeTab]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopBinaural();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Next/Previous track
  const nextTrack = () => {
    const currentIndex = hypnosisTracks.findIndex(t => t.id === selectedTrack.id);
    const nextIndex = (currentIndex + 1) % hypnosisTracks.length;
    setSelectedTrack(hypnosisTracks[nextIndex]);
  };

  const prevTrack = () => {
    const currentIndex = hypnosisTracks.findIndex(t => t.id === selectedTrack.id);
    const prevIndex = (currentIndex - 1 + hypnosisTracks.length) % hypnosisTracks.length;
    setSelectedTrack(hypnosisTracks[prevIndex]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-50 to-purple-100 pb-32">
      {/* Header */}
      <header className="pt-6 pb-4 px-5">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 rounded-xl bg-white/60 text-purple-600 hover:bg-white/80 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-purple-900">Relax & Heal</h1>
              <p className="text-sm text-purple-600/70">Audio wellness sessions</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-5">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Headphone Warning */}
          {showHeadphoneWarning && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-5 h-5 text-pink-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-900 mb-1">Headphones Recommended</h3>
                  <p className="text-sm text-purple-600/70">
                    For the best experience, especially with binaural beats, use stereo headphones.
                  </p>
                </div>
                <button
                  onClick={() => setShowHeadphoneWarning(false)}
                  className="text-purple-400 hover:text-purple-600 text-sm"
                >
                  Got it
                </button>
              </div>
            </div>
          )}

          {/* Tab Selector */}
          <div className="flex gap-2 p-1 bg-white/60 rounded-xl">
            <button
              onClick={() => setActiveTab('hypnosis')}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'hypnosis'
                  ? 'bg-white text-purple-700 shadow-md'
                  : 'text-purple-500 hover:text-purple-700'
              }`}
            >
              Hypnosis & Meditation
            </button>
            <button
              onClick={() => setActiveTab('binaural')}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'binaural'
                  ? 'bg-white text-purple-700 shadow-md'
                  : 'text-purple-500 hover:text-purple-700'
              }`}
            >
              Binaural Beats
            </button>
          </div>

          {/* Hypnosis Tab */}
          {activeTab === 'hypnosis' && (
            <>
              {/* Track List */}
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {hypnosisTracks.map((track) => {
                  const Icon = track.icon;
                  const isSelected = selectedTrack.id === track.id;
                  return (
                    <button
                      key={track.id}
                      onClick={() => setSelectedTrack(track)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-white shadow-md border-2 border-purple-300'
                          : 'bg-white/60 hover:bg-white/80'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${track.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-purple-900 text-sm">{track.name}</div>
                        <div className="text-xs text-purple-500">{track.category} • {track.duration}</div>
                      </div>
                      {isSelected && isPlaying && (
                        <div className="flex items-center gap-0.5">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 bg-purple-400 rounded-full animate-pulse"
                              style={{ height: `${8 + Math.random() * 8}px`, animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Now Playing Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 border border-purple-100 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedTrack.color} flex items-center justify-center shadow-lg`}>
                    <selectedTrack.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-purple-900">{selectedTrack.name}</h3>
                    <p className="text-sm text-purple-500">{selectedTrack.description}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-purple-100 rounded-full appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-purple-400 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={prevTrack}
                    className="p-3 rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                      isPlaying
                        ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                        : `bg-gradient-to-br ${selectedTrack.color} text-white hover:opacity-90`
                    }`}
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </button>

                  <button
                    onClick={nextTrack}
                    className="p-3 rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>

                  <div className="w-20">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Binaural Tab */}
          {activeTab === 'binaural' && (
            <>
              {/* Brain State Selector */}
              <div>
                <h2 className="text-sm font-semibold text-purple-800 mb-3">Select Brain State</h2>
                <div className="grid grid-cols-2 gap-3">
                  {brainStates.map((state) => {
                    const Icon = state.icon;
                    const isSelected = selectedState.id === state.id;
                    return (
                      <button
                        key={state.id}
                        onClick={() => setSelectedState(state)}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? 'border-purple-400 bg-white shadow-lg'
                            : 'border-transparent bg-white/60 hover:bg-white/80'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${state.color} flex items-center justify-center mb-2`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-purple-900">{state.name}</div>
                          <div className="text-sm text-purple-500">{state.frequency} Hz</div>
                          <div className="text-xs text-purple-400 mt-1">{state.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Binaural Player */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-purple-100 shadow-lg">
                <div className="text-center mb-6">
                  <div className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br ${selectedState.color} flex items-center justify-center mb-4 shadow-lg`}>
                    {isPlaying ? (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-white rounded-full animate-pulse"
                            style={{ height: `${12 + Math.random() * 20}px`, animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </div>
                    ) : (
                      <selectedState.icon className="w-12 h-12 text-white" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-purple-900">{selectedState.name} Waves</h3>
                  <p className="text-purple-500">{selectedState.frequency} Hz • {selectedState.description}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-3 rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={togglePlay}
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                      isPlaying
                        ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                        : `bg-gradient-to-br ${selectedState.color} text-white hover:opacity-90`
                    }`}
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </button>

                  <div className="w-24">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                </div>

                <div className="text-center text-sm text-purple-500 mt-4">
                  {isPlaying ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      Playing • Base: {selectedState.baseFrequency}Hz
                    </span>
                  ) : (
                    'Tap play to start'
                  )}
                </div>
              </div>

              {/* How it Works */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-purple-100">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-purple-900">How it works</h3>
                </div>
                <p className="text-sm text-purple-600/70 leading-relaxed">
                  Binaural beats play two slightly different frequencies in each ear.
                  Your brain perceives the difference as a rhythmic beat, which can help
                  guide your brainwaves into different states.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
