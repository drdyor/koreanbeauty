import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Send,
  Settings,
  ChevronRight,
  Sparkles,
  Wind,
  Archive,
  Clock,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Check if onboarding is complete
function isOnboardingComplete() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('onboarding-complete') === 'true';
}

export const Route = createFileRoute('/')({
  component: GlowChiHome,
});

// Recent thoughts that have been offloaded
const recentThoughts = [
  {
    text: 'Remember to call mom about the weekend',
    time: '2h ago',
    resolved: false,
  },
  {
    text: 'That presentation feedback is still bugging me',
    time: '4h ago',
    resolved: true,
  },
  {
    text: 'Apartment decision by Friday',
    time: '1d ago',
    resolved: false,
  },
];

// Welcome Page - Warm, inviting
function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-violet-50 to-pink-50">
      <main className="max-w-md mx-auto px-6 py-12">
        {/* Mascot - central, friendly */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-violet-200/50 rounded-full blur-2xl scale-125" />
            <img
              src="/images/guardian-cat.png"
              alt="GlowChi"
              className="relative w-32 h-32 object-contain"
            />
          </div>
        </div>

        {/* Direct headline */}
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-3">
          Stop the loop.
        </h1>
        <p className="text-slate-500 text-center mb-10">
          Thoughts go here to die, resolve, or transform. Not to be stored.
        </p>

        {/* Primary CTA */}
        <Button
          onClick={() => navigate({ to: '/onboarding' })}
          className="w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white text-lg py-6 rounded-2xl font-medium shadow-lg shadow-violet-200"
        >
          Get started
        </Button>

        <p className="text-slate-400 text-center text-sm mt-4 mb-12">
          No account needed. Just start.
        </p>

        {/* Value props - friction reduction, not storage */}
        <div className="space-y-4">
          {[
            { icon: Archive, text: 'Dump what\'s stuck' },
            { icon: Sparkles, text: 'Get it reframed, not stored' },
            { icon: Wind, text: 'Leave lighter' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/80">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-violet-500" />
              </div>
              <span className="text-slate-700">{item.text}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function GlowChiHome() {
  const navigate = useNavigate();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [thoughtText, setThoughtText] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    setOnboardingDone(isOnboardingComplete());
  }, []);

  // Loading state
  if (onboardingDone === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-violet-50 to-pink-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-violet-200 border-t-violet-500 animate-spin" />
      </div>
    );
  }

  // Show welcome page if onboarding not done
  if (!onboardingDone) {
    return <WelcomePage />;
  }

  const handleCapture = () => {
    if (thoughtText.trim()) {
      // Would save to storage here
      setThoughtText('');
      setIsCapturing(false);
    }
  };

  // Main dashboard - warm, focused on ONE action
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-violet-50 to-pink-50">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/guardian-cat.png" alt="" className="w-10 h-10" />
            <span className="font-semibold text-slate-700">GlowChi</span>
          </div>
          <Button variant="ghost" size="icon" asChild className="text-slate-400 hover:text-slate-600 hover:bg-white/50">
            <Link to="/settings">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-4">
        {/* PRIMARY: Capture Area */}
        <section className="mb-8">
          {!isCapturing ? (
            // Collapsed state - one big button
            <button
              onClick={() => setIsCapturing(true)}
              className="w-full p-6 bg-white/70 backdrop-blur-sm border-2 border-dashed border-violet-200 rounded-2xl hover:border-violet-300 hover:bg-white/80 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6 text-violet-500" />
                </div>
                <div>
                  <div className="font-medium text-slate-700">What won't shut up?</div>
                  <div className="text-sm text-slate-400">Drop it here</div>
                </div>
              </div>
            </button>
          ) : (
            // Expanded state - text input
            <div className="bg-white/80 backdrop-blur-sm border border-violet-100 rounded-2xl p-5 shadow-lg shadow-violet-100/50">
              <textarea
                value={thoughtText}
                onChange={(e) => setThoughtText(e.target.value)}
                placeholder="Dump it here. Don't edit, just drop it..."
                className="w-full bg-transparent text-slate-700 placeholder-slate-400 resize-none focus:outline-none min-h-[120px] text-lg"
                autoFocus
              />
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-violet-100">
                <button
                  onClick={() => { setIsCapturing(false); setThoughtText(''); }}
                  className="text-slate-400 hover:text-slate-600 text-sm"
                >
                  Cancel
                </button>
                <Button
                  onClick={handleCapture}
                  disabled={!thoughtText.trim()}
                  className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-xl px-6"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Capture
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Recent thoughts */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-slate-600">Recent</h2>
            <Link to="/energy-dump" className="text-sm text-violet-500 hover:text-violet-600 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentThoughts.map((thought, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border transition-all ${
                  thought.resolved
                    ? 'bg-emerald-50/50 border-emerald-100'
                    : 'bg-white/60 border-white/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    thought.resolved ? 'bg-emerald-100' : 'bg-violet-100'
                  }`}>
                    {thought.resolved ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-violet-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`${thought.resolved ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                      {thought.text}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {thought.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Think Tank - Hamster Council */}
        <section className="mb-4">
          <Link
            to="/thinktank"
            className="block p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl hover:shadow-md hover:shadow-amber-100/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center group-hover:scale-105 transition-transform text-2xl">
                🐹
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-700">Ask the Hamsters</div>
                <div className="text-sm text-slate-500">See what patterns they've noticed</div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-300 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </section>

        {/* Need a break? - Gentle nudge to modes */}
        <section>
          <Link
            to="/modes"
            className="block p-5 bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-100 rounded-2xl hover:shadow-md hover:shadow-violet-100/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Wind className="w-6 h-6 text-violet-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-700">Need a moment?</div>
                <div className="text-sm text-slate-500">Focus, breathe, or just rest</div>
              </div>
              <ChevronRight className="w-5 h-5 text-violet-300 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </section>
      </main>
    </div>
  );
}
