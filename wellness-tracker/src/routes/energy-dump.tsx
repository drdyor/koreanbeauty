import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ChevronLeft, Plus, X, Sparkles, Target, Heart } from 'lucide-react';

export const Route = createFileRoute('/energy-dump')({
  component: EnergyDumpPage,
});

type AnimationState = 'input' | 'dropping' | 'stored' | 'complete';

function EnergyDumpPage() {
  const [drains, setDrains] = useState<string[]>([]);
  const [currentDrain, setCurrentDrain] = useState('');
  const [animationState, setAnimationState] = useState<AnimationState>('input');
  const [currentImage, setCurrentImage] = useState(1);

  const addDrain = () => {
    if (currentDrain.trim()) {
      setDrains([...drains, currentDrain.trim()]);
      setCurrentDrain('');
    }
  };

  const removeDrain = (index: number) => {
    setDrains(drains.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addDrain();
    }
  };

  const startAnimation = () => {
    if (drains.length === 0) return;

    // Save drains to localStorage for later retrieval
    const stored = JSON.parse(localStorage.getItem('glowchi-energy-drains') || '[]');
    const newEntry = {
      id: Date.now(),
      drains,
      storedAt: new Date().toISOString(),
      unpacked: false,
    };
    localStorage.setItem('glowchi-energy-drains', JSON.stringify([...stored, newEntry]));

    // Start animation sequence
    setAnimationState('dropping');
    setCurrentImage(1);

    // Image 1 → Image 2 (bag drops into chest)
    setTimeout(() => {
      setCurrentImage(2);
    }, 1200);

    // Image 2 → Image 3 (cat appears on chest)
    setTimeout(() => {
      setAnimationState('stored');
      setCurrentImage(3);
    }, 2400);

    // Show complete state
    setTimeout(() => {
      setAnimationState('complete');
    }, 4000);
  };

  const reset = () => {
    setDrains([]);
    setCurrentDrain('');
    setAnimationState('input');
    setCurrentImage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
      {/* Ambient Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl" />
      </div>

      {/* Floating Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute text-purple-300/40 animate-float-gentle"
            style={{
              left: `${15 + i * 15}%`,
              top: `${10 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              fontSize: `${12 + (i % 3) * 4}px`,
            }}
          >
            ✦
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="relative pt-6 pb-4 px-5">
        <div className="max-w-lg mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/40 backdrop-blur-sm text-purple-600 hover:bg-white/60 transition-all text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        </div>
      </header>

      <div className="relative px-5 pb-8">
        <div className="max-w-lg mx-auto">
          {/* Input State */}
          {animationState === 'input' && (
            <div className="space-y-6">
              {/* Hero Section with Cat */}
              <div className="text-center pt-2 pb-4">
                <div className="relative inline-block">
                  {/* Glow behind cat */}
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-400/30 to-pink-400/30 rounded-full blur-2xl scale-110" />
                  <img
                    src="/images/guardian-cat.png"
                    alt="Guardian Cat"
                    className="relative w-44 h-44 mx-auto object-contain drop-shadow-2xl animate-float-gentle"
                  />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-violet-500 to-pink-500 bg-clip-text text-transparent mt-4 mb-2">
                  Energy Dump
                </h1>
                <p className="text-purple-500/80 text-sm max-w-xs mx-auto">
                  Release what weighs on your mind. Your guardian will keep it safe.
                </p>
              </div>

              {/* Input Card */}
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl shadow-purple-200/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-semibold text-purple-900">What's on your mind?</h2>
                </div>

                {/* Input Field */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={currentDrain}
                    onChange={(e) => setCurrentDrain(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a worry, thought, or task..."
                    className="w-full px-5 py-4 pr-14 rounded-2xl bg-purple-50/50 border-2 border-purple-100
                             text-purple-900 placeholder-purple-300
                             focus:outline-none focus:border-purple-300 focus:bg-white/80 transition-all"
                  />
                  <button
                    onClick={addDrain}
                    disabled={!currentDrain.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl
                             bg-gradient-to-br from-purple-500 to-pink-500 text-white
                             hover:from-purple-600 hover:to-pink-600 transition-all
                             disabled:opacity-40 disabled:cursor-not-allowed
                             shadow-lg shadow-purple-300/40 hover:shadow-purple-400/50
                             hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-5 h-5 mx-auto" />
                  </button>
                </div>

                {/* Empty State */}
                {drains.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-purple-200/50 rounded-2xl bg-purple-50/30">
                    <div className="text-3xl mb-2">🌙</div>
                    <p className="text-purple-400 text-sm">
                      Add the things taking up mental space
                    </p>
                  </div>
                )}

                {/* Drains List */}
                {drains.length > 0 && (
                  <div className="space-y-2">
                    {drains.map((drain, index) => (
                      <div
                        key={index}
                        className="group flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50
                                 rounded-xl border border-purple-100/50 hover:border-purple-200 transition-all
                                 animate-slide-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0" />
                        <span className="flex-1 text-purple-800 text-sm">{drain}</span>
                        <button
                          onClick={() => removeDrain(index)}
                          className="p-1.5 text-purple-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Let Go Button */}
              {drains.length > 0 && (
                <button
                  onClick={startAnimation}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500
                           text-white font-semibold text-lg shadow-xl shadow-purple-400/30
                           hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]
                           transition-all duration-200 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Put it away for now
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-violet-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}

              {/* Stored Items Link */}
              <Link
                to="/energy-dump/stored"
                className="block text-center text-purple-400 hover:text-purple-600 text-sm transition-colors"
              >
                View previously stored items →
              </Link>
            </div>
          )}

          {/* Animation States */}
          {(animationState === 'dropping' || animationState === 'stored') && (
            <div className="text-center space-y-6 pt-4">
              {/* Status Text Above */}
              <div className="space-y-2">
                {currentImage === 1 && (
                  <div className="animate-fade-in">
                    <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                      Gathering your worries...
                    </p>
                    <p className="text-purple-400 text-sm mt-1">Taking a deep breath</p>
                  </div>
                )}
                {currentImage === 2 && (
                  <div className="animate-fade-in">
                    <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                      Storing them safely...
                    </p>
                    <p className="text-purple-400 text-sm mt-1">Into the treasure chest they go</p>
                  </div>
                )}
                {currentImage === 3 && (
                  <div className="animate-fade-in">
                    <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                      Safe and sound
                    </p>
                    <p className="text-purple-400 text-sm mt-1">Your guardian is watching over them</p>
                  </div>
                )}
              </div>

              {/* Animated Image */}
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-purple-400/20 to-pink-400/20 rounded-3xl blur-2xl scale-105" />

                <img
                  src={`/images/mental-load-${currentImage}.jpg`}
                  alt="Mental load animation"
                  className={`relative w-full max-w-md mx-auto rounded-3xl shadow-2xl shadow-purple-300/40 transition-all duration-700 ${
                    currentImage === 2 ? 'scale-105' : 'scale-100'
                  }`}
                />

                {/* Floating drains during animation */}
                {animationState === 'dropping' && currentImage === 1 && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2 max-w-xs">
                    {drains.slice(0, 4).map((drain, i) => (
                      <div
                        key={i}
                        className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs text-purple-700 shadow-lg animate-float-away"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      >
                        {drain.length > 15 ? drain.slice(0, 15) + '...' : drain}
                      </div>
                    ))}
                  </div>
                )}

                {/* Sparkle effects */}
                {currentImage === 3 && (
                  <>
                    <div className="absolute top-4 right-8 text-2xl animate-pulse">✨</div>
                    <div className="absolute bottom-8 left-8 text-xl animate-pulse" style={{ animationDelay: '0.3s' }}>✨</div>
                    <div className="absolute top-1/3 left-4 text-lg animate-pulse" style={{ animationDelay: '0.6s' }}>✨</div>
                  </>
                )}
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 pt-2">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`w-2 h-2 rounded-full transition-all duration-500 ${
                      currentImage >= num
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-125'
                        : 'bg-purple-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Complete State */}
          {animationState === 'complete' && (
            <div className="text-center space-y-6 pt-4 animate-fade-in">
              {/* Success Header */}
              <div>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-300/40 mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  Your worries are safe
                </h2>
                <p className="text-purple-500/80 text-sm mt-1">
                  {drains.length} item{drains.length > 1 ? 's' : ''} stored with your guardian
                </p>
              </div>

              {/* Cat on Chest */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-400/20 to-pink-400/20 rounded-3xl blur-2xl scale-105" />
                <img
                  src="/images/mental-load-3.jpg"
                  alt="Guardian cat protecting your worries"
                  className="relative w-full max-w-md mx-auto rounded-3xl shadow-2xl shadow-purple-300/40"
                />

                {/* Floating hearts */}
                <div className="absolute -top-3 -right-3 text-2xl animate-bounce">💜</div>
                <div className="absolute -bottom-2 -left-2 text-xl animate-bounce" style={{ animationDelay: '0.2s' }}>💖</div>
              </div>

              {/* Quote Card */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-xl shadow-purple-200/20">
                <p className="text-purple-600 italic text-lg">
                  "Rest easy now. I'll keep watch until you're ready."
                </p>
                <p className="text-purple-400 text-sm mt-2">— Your Guardian</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Link
                  to="/"
                  className="block w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500
                           text-white font-semibold shadow-xl shadow-purple-400/30
                           hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]
                           transition-all duration-200"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Target className="w-5 h-5" />
                    Focus on my goals
                  </span>
                </Link>

                <div className="flex gap-3">
                  <button
                    onClick={reset}
                    className="flex-1 py-3 rounded-xl bg-white/60 backdrop-blur-sm text-purple-600 font-medium
                             hover:bg-white/80 transition-all border border-purple-100"
                  >
                    Add more
                  </button>

                  <Link
                    to="/energy-dump/stored"
                    className="flex-1 py-3 rounded-xl bg-purple-100/60 backdrop-blur-sm text-purple-600 font-medium
                             hover:bg-purple-100 transition-all text-center border border-purple-200/50"
                  >
                    View all stored
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-float-gentle {
          animation: float-gentle 4s ease-in-out infinite;
        }

        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        @keyframes float-away {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          50% { opacity: 0.8; transform: translateY(-30px) scale(0.95); }
          100% { opacity: 0; transform: translateY(-60px) scale(0.9); }
        }
        .animate-float-away {
          animation: float-away 1.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
