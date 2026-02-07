import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

export const Route = createFileRoute('/modes')({
  component: ModesPage,
});

// Mode definitions
type ModeId = 'focus' | 'calm' | 'rest' | 'reset';

interface Mode {
  id: ModeId;
  name: string;
  tagline: string;
  description: string;
  defaultDuration: number; // seconds
  durations: number[]; // available durations in seconds
  bgClass: string;
  accentClass: string;
}

const modes: Mode[] = [
  {
    id: 'focus',
    name: 'Focus',
    tagline: 'Lock in',
    description: 'Minimal distraction. Just you and the timer.',
    defaultDuration: 25 * 60, // 25 min
    durations: [15 * 60, 25 * 60, 45 * 60, 60 * 60],
    bgClass: 'bg-zinc-950',
    accentClass: 'text-amber-400',
  },
  {
    id: 'calm',
    name: 'Calm',
    tagline: 'Settle down',
    description: 'Guided breathing to quiet your mind.',
    defaultDuration: 5 * 60, // 5 min
    durations: [3 * 60, 5 * 60, 10 * 60, 15 * 60],
    bgClass: 'bg-indigo-950',
    accentClass: 'text-indigo-300',
  },
  {
    id: 'rest',
    name: 'Rest',
    tagline: 'Recover',
    description: 'Low stimulation. Just be here.',
    defaultDuration: 10 * 60, // 10 min
    durations: [5 * 60, 10 * 60, 20 * 60, 30 * 60],
    bgClass: 'bg-stone-950',
    accentClass: 'text-stone-400',
  },
  {
    id: 'reset',
    name: 'Reset',
    tagline: '2 minutes',
    description: 'Quick box breathing. In, hold, out, hold.',
    defaultDuration: 2 * 60, // 2 min
    durations: [2 * 60], // fixed
    bgClass: 'bg-slate-950',
    accentClass: 'text-slate-300',
  },
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
}

// Breathing phases for calm/reset modes
type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

const breathPhaseDurations: Record<BreathPhase, number> = {
  'inhale': 4,
  'hold-in': 4,
  'exhale': 4,
  'hold-out': 4,
};

const breathPhaseLabels: Record<BreathPhase, string> = {
  'inhale': 'Breathe in',
  'hold-in': 'Hold',
  'exhale': 'Breathe out',
  'hold-out': 'Hold',
};

function ModesPage() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Breathing state
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [breathProgress, setBreathProgress] = useState(0);

  // Timer logic
  useEffect(() => {
    if (!isActive || isPaused || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          setIsActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, timeRemaining]);

  // Breathing logic for calm/reset modes
  useEffect(() => {
    if (!isActive || isPaused) return;
    if (selectedMode?.id !== 'calm' && selectedMode?.id !== 'reset') return;

    const phaseOrder: BreathPhase[] = ['inhale', 'hold-in', 'exhale', 'hold-out'];
    let currentPhaseIndex = phaseOrder.indexOf(breathPhase);
    let elapsed = 0;
    const phaseDuration = breathPhaseDurations[breathPhase] * 1000;

    const interval = setInterval(() => {
      elapsed += 50;
      setBreathProgress(elapsed / phaseDuration);

      if (elapsed >= phaseDuration) {
        currentPhaseIndex = (currentPhaseIndex + 1) % 4;
        setBreathPhase(phaseOrder[currentPhaseIndex]);
        elapsed = 0;
        setBreathProgress(0);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, isPaused, selectedMode, breathPhase]);

  const startMode = useCallback((mode: Mode, dur: number) => {
    setSelectedMode(mode);
    setDuration(dur);
    setTimeRemaining(dur);
    setIsActive(true);
    setIsPaused(false);
    setBreathPhase('inhale');
    setBreathProgress(0);
  }, []);

  const exitMode = useCallback(() => {
    setSelectedMode(null);
    setIsActive(false);
    setIsPaused(false);
    setTimeRemaining(0);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((p) => !p);
  }, []);

  const restart = useCallback(() => {
    setTimeRemaining(duration);
    setIsActive(true);
    setIsPaused(false);
    setBreathPhase('inhale');
    setBreathProgress(0);
  }, [duration]);

  // Session complete
  const isComplete = selectedMode && timeRemaining === 0 && !isActive;

  // Mode Selection Screen
  if (!selectedMode) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        {/* Header */}
        <header className="px-6 py-4">
          <button
            onClick={() => navigate({ to: '/' })}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-2">What do you need?</h1>
          <p className="text-zinc-500 mb-10">Pick a mode. We'll handle the rest.</p>

          <div className="grid grid-cols-2 gap-4">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => startMode(mode, mode.defaultDuration)}
                className={`${mode.bgClass} border border-zinc-800 rounded-2xl p-6 text-left hover:border-zinc-700 transition-all group`}
              >
                <div className={`text-2xl font-bold ${mode.accentClass} mb-1`}>
                  {mode.name}
                </div>
                <div className="text-zinc-400 text-sm mb-3">{mode.tagline}</div>
                <div className="text-zinc-600 text-xs">{mode.description}</div>

                {/* Duration pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {mode.durations.map((dur) => (
                    <span
                      key={dur}
                      className={`px-2 py-1 rounded text-xs ${
                        dur === mode.defaultDuration
                          ? 'bg-zinc-800 text-zinc-300'
                          : 'bg-zinc-900 text-zinc-600'
                      }`}
                    >
                      {formatDuration(dur)}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Session Complete Screen
  if (isComplete) {
    return (
      <div className={`min-h-screen ${selectedMode.bgClass} text-white flex flex-col`}>
        <header className="px-6 py-4">
          <button onClick={exitMode} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6">
          <div className={`text-5xl font-bold ${selectedMode.accentClass} mb-4`}>Done</div>
          <p className="text-zinc-500 mb-8">{formatDuration(duration)} of {selectedMode.name.toLowerCase()}</p>

          <div className="flex gap-4">
            <button
              onClick={restart}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Again
            </button>
            <button
              onClick={exitMode}
              className="px-6 py-3 bg-white text-zinc-900 hover:bg-zinc-200 rounded-xl font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Active Mode Screen - FOCUS
  if (selectedMode.id === 'focus') {
    return (
      <div className={`min-h-screen ${selectedMode.bgClass} text-white flex flex-col`}>
        {/* Minimal exit */}
        <header className="px-6 py-4">
          <button onClick={exitMode} className="text-zinc-700 hover:text-zinc-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Subtle ambient pulse */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-96 h-96 rounded-full bg-amber-500/5 animate-pulse"
              style={{ animationDuration: '4s' }}
            />
          </div>

          {/* Timer */}
          <div className={`text-8xl font-light ${selectedMode.accentClass} tabular-nums relative z-10`}>
            {formatTime(timeRemaining)}
          </div>

          {/* Controls */}
          <div className="flex gap-4 mt-12 relative z-10">
            <button
              onClick={togglePause}
              className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors"
            >
              {isPaused ? (
                <Play className="w-5 h-5 text-zinc-300 ml-0.5" />
              ) : (
                <Pause className="w-5 h-5 text-zinc-300" />
              )}
            </button>
          </div>

          {isPaused && (
            <div className="text-zinc-600 text-sm mt-6 relative z-10">Paused</div>
          )}
        </main>
      </div>
    );
  }

  // Active Mode Screen - CALM
  if (selectedMode.id === 'calm') {
    const circleScale = breathPhase === 'inhale'
      ? 0.6 + (breathProgress * 0.4)
      : breathPhase === 'exhale'
        ? 1 - (breathProgress * 0.4)
        : breathPhase === 'hold-in' ? 1 : 0.6;

    return (
      <div className={`min-h-screen ${selectedMode.bgClass} text-white flex flex-col overflow-hidden`}>
        <header className="px-6 py-4 relative z-10">
          <button onClick={exitMode} className="text-indigo-800 hover:text-indigo-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 relative">
          {/* Breathing circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-80 h-80 rounded-full bg-indigo-500/20 transition-transform duration-100"
              style={{ transform: `scale(${circleScale})` }}
            />
            <div
              className="absolute w-64 h-64 rounded-full bg-indigo-400/20 transition-transform duration-100"
              style={{ transform: `scale(${circleScale})` }}
            />
            <div
              className="absolute w-48 h-48 rounded-full bg-indigo-300/20 transition-transform duration-100"
              style={{ transform: `scale(${circleScale})` }}
            />
          </div>

          {/* Breath instruction */}
          <div className={`text-3xl font-light ${selectedMode.accentClass} relative z-10 mb-4`}>
            {breathPhaseLabels[breathPhase]}
          </div>

          {/* Timer (subtle) */}
          <div className="text-indigo-700 text-sm relative z-10">
            {formatTime(timeRemaining)}
          </div>

          {/* Pause control */}
          <button
            onClick={togglePause}
            className="mt-12 w-12 h-12 rounded-full bg-indigo-900/50 border border-indigo-800/50 flex items-center justify-center hover:bg-indigo-800/50 transition-colors relative z-10"
          >
            {isPaused ? (
              <Play className="w-4 h-4 text-indigo-400 ml-0.5" />
            ) : (
              <Pause className="w-4 h-4 text-indigo-400" />
            )}
          </button>
        </main>
      </div>
    );
  }

  // Active Mode Screen - REST
  if (selectedMode.id === 'rest') {
    return (
      <div className={`min-h-screen ${selectedMode.bgClass} text-white flex flex-col`}>
        <header className="px-6 py-4">
          <button onClick={exitMode} className="text-stone-800 hover:text-stone-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 relative">
          {/* Slow drifting ambient */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute w-[600px] h-[600px] rounded-full bg-stone-800/30 blur-3xl"
              style={{
                top: '20%',
                left: '10%',
                animation: 'drift 20s ease-in-out infinite',
              }}
            />
            <div
              className="absolute w-[400px] h-[400px] rounded-full bg-amber-900/20 blur-3xl"
              style={{
                bottom: '10%',
                right: '10%',
                animation: 'drift 25s ease-in-out infinite reverse',
              }}
            />
          </div>

          {/* Minimal content */}
          <div className={`text-xl ${selectedMode.accentClass} relative z-10 mb-2`}>
            Just be here
          </div>
          <div className="text-stone-700 text-sm relative z-10">
            {formatTime(timeRemaining)}
          </div>

          {/* Subtle pause */}
          <button
            onClick={togglePause}
            className="mt-16 text-stone-700 hover:text-stone-500 transition-colors relative z-10"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
        </main>

        <style>{`
          @keyframes drift {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(30px, -30px); }
          }
        `}</style>
      </div>
    );
  }

  // Active Mode Screen - RESET (box breathing)
  if (selectedMode.id === 'reset') {
    const boxPosition =
      breathPhase === 'inhale' ? { x: 0, y: -40 } :
      breathPhase === 'hold-in' ? { x: 40, y: -40 } :
      breathPhase === 'exhale' ? { x: 40, y: 0 } :
      { x: 0, y: 0 };

    const dotX = breathPhase === 'inhale'
      ? breathProgress * 40
      : breathPhase === 'hold-in'
        ? 40
        : breathPhase === 'exhale'
          ? 40 - (breathProgress * 40)
          : 0;

    const dotY = breathPhase === 'inhale'
      ? -40
      : breathPhase === 'hold-in'
        ? -40 + (breathProgress * 40)
        : breathPhase === 'exhale'
          ? 0
          : -(breathProgress * 40);

    return (
      <div className={`min-h-screen ${selectedMode.bgClass} text-white flex flex-col`}>
        <header className="px-6 py-4">
          <button onClick={exitMode} className="text-slate-700 hover:text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Box breathing visual */}
          <div className="relative w-40 h-40 mb-8">
            {/* Box outline */}
            <div className="absolute inset-0 border-2 border-slate-800 rounded-lg" />

            {/* Moving dot */}
            <div
              className="absolute w-4 h-4 bg-slate-300 rounded-full transition-all duration-100"
              style={{
                left: `calc(50% + ${dotX}px - 8px)`,
                top: `calc(50% + ${dotY}px - 8px)`,
              }}
            />

            {/* Corner labels */}
            <div className="absolute -top-6 left-0 text-xs text-slate-600">In</div>
            <div className="absolute -top-6 right-0 text-xs text-slate-600">Hold</div>
            <div className="absolute -bottom-6 right-0 text-xs text-slate-600">Out</div>
            <div className="absolute -bottom-6 left-0 text-xs text-slate-600">Hold</div>
          </div>

          {/* Phase label */}
          <div className={`text-2xl font-light ${selectedMode.accentClass} mb-2`}>
            {breathPhaseLabels[breathPhase]}
          </div>

          {/* Timer */}
          <div className="text-slate-600 text-sm">
            {formatTime(timeRemaining)}
          </div>
        </main>
      </div>
    );
  }

  return null;
}
