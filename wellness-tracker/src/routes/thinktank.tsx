import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ChevronLeft, Send, Loader2, History, X, ChevronRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  HamsterId,
  HAMSTER_CONFIG,
  getAllHamsters,
  getHamster,
} from '@/lib/thinktank/config';
import {
  getHamsterResponse,
  saveSession,
  getSessions,
  ThinkTankSession,
  runHamsterCouncil,
  CouncilResult,
} from '@/lib/thinktank/service';

export const Route = createFileRoute('/thinktank')({
  component: ThinkTankPage,
});

// Hotspot positions for each hamster on the background image
// Based on actual hamster positions in thinktank-bg.jpg
const HAMSTER_HOTSPOTS: Record<HamsterId, { top: string; left: string; size: string }> = {
  1: { top: '62%', left: '23%', size: '14%' },  // Al - front-left (gray/white with glasses)
  2: { top: '52%', left: '38%', size: '14%' },  // Erik - back-left (orange with red ribbon)
  3: { top: '52%', left: '60%', size: '14%' },  // Cogni - back-right (with laptop)
  4: { top: '58%', left: '77%', size: '14%' },  // Rocky - front-right (near whiteboard)
};

function ThinkTankPage() {
  const [selectedHamster, setSelectedHamster] = useState<HamsterId | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [problem, setProblem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [toolFields, setToolFields] = useState<Record<string, string>>({});
  const [showToolComplete, setShowToolComplete] = useState(false);

  // Council consensus state
  const [showCouncil, setShowCouncil] = useState(false);
  const [councilLoading, setCouncilLoading] = useState(false);
  const [councilResult, setCouncilResult] = useState<CouncilResult | null>(null);
  const [councilProblem, setCouncilProblem] = useState('');

  const handleSelectHamster = (id: HamsterId) => {
    setSelectedHamster(id);
    setProblem('');
    setResponse(null);
    setToolFields({});
    setShowToolComplete(false);
  };

  const handleSubmitProblem = async () => {
    if (!selectedHamster || !problem.trim()) return;

    setIsLoading(true);
    try {
      const result = await getHamsterResponse(selectedHamster, problem);
      setResponse(result.response);
    } catch (err) {
      console.error('Failed to get response:', err);
      setResponse("I'm having trouble thinking right now. Try again in a moment!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSession = () => {
    if (!selectedHamster || !response) return;

    const session: ThinkTankSession = {
      id: Date.now().toString(),
      hamsterId: selectedHamster,
      problem,
      response,
      toolResult: toolFields,
      timestamp: new Date().toISOString(),
    };
    saveSession(session);
    setShowToolComplete(true);
  };

  const handleCloseChat = () => {
    setSelectedHamster(null);
    setProblem('');
    setResponse(null);
    setToolFields({});
    setShowToolComplete(false);
  };

  // Council consensus handlers
  const handleAskAllHamsters = async () => {
    if (!councilProblem.trim()) return;
    setShowCouncil(true);
    setCouncilLoading(true);
    setCouncilResult(null);

    try {
      const result = await runHamsterCouncil(councilProblem);
      setCouncilResult(result);
    } catch (err) {
      console.error('[Council] Error:', err);
    } finally {
      setCouncilLoading(false);
    }
  };

  const handleCloseCouncil = () => {
    setShowCouncil(false);
    setCouncilResult(null);
    setCouncilProblem('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-amber-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="relative pt-6 pb-4 px-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/40 backdrop-blur-sm text-amber-700 hover:bg-white/60 transition-all text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>

          <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
            Think Tank
          </h1>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/40 backdrop-blur-sm text-amber-700 hover:bg-white/60 transition-all text-sm"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="relative px-5 pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Ask All Hamsters Input */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/50">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-800">Ask All Hamsters</h3>
            </div>
            <p className="text-sm text-purple-600/80 mb-3">
              Get consensus from the full council - they'll debate and rank each other's advice.
            </p>
            <textarea
              value={councilProblem}
              onChange={(e) => setCouncilProblem(e.target.value)}
              placeholder="What's on your mind? The whole council will deliberate..."
              className="w-full p-3 rounded-xl bg-white/80 border border-purple-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none min-h-[80px] text-sm"
            />
            <Button
              onClick={handleAskAllHamsters}
              disabled={!councilProblem.trim() || councilLoading}
              className="w-full mt-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2.5 rounded-xl"
            >
              {councilLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Council is deliberating...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Ask All 4 Hamsters
                </>
              )}
            </Button>
          </div>

          {/* Council View - Always visible */}
          <CouncilView
            onSelectHamster={handleSelectHamster}
            selectedHamster={selectedHamster}
          />

          {/* History View as Modal */}
          {showHistory && (
            <HistoryView onBack={() => setShowHistory(false)} />
          )}
        </div>
      </main>

      {/* Chat Modal - Slides up from bottom */}
      {selectedHamster && (
        <ChatModal
          hamsterId={selectedHamster}
          problem={problem}
          setProblem={setProblem}
          response={response}
          isLoading={isLoading}
          onSubmit={handleSubmitProblem}
          onClose={handleCloseChat}
          toolFields={toolFields}
          setToolFields={setToolFields}
          onSaveSession={handleSaveSession}
          showToolComplete={showToolComplete}
        />
      )}

      {/* Council Results Modal */}
      {showCouncil && (
        <CouncilModal
          result={councilResult}
          isLoading={councilLoading}
          problem={councilProblem}
          onClose={handleCloseCouncil}
        />
      )}

      {/* Floating animation styles */}
      <style>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-gentle {
          animation: float-gentle 3s ease-in-out infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Council View Component
function CouncilView({
  onSelectHamster,
  selectedHamster,
}: {
  onSelectHamster: (id: HamsterId) => void;
  selectedHamster: HamsterId | null;
}) {
  const [hoveredHamster, setHoveredHamster] = useState<HamsterId | null>(null);
  const hamsters = getAllHamsters();

  return (
    <div className="space-y-6">
      {/* Intro Text */}
      <div className="text-center pt-2 pb-4">
        <h2 className="text-2xl font-bold text-amber-800 mb-2">
          What patterns do you see?
        </h2>
        <p className="text-amber-600/80 text-sm max-w-md mx-auto">
          Four detectives watching your check-ins and calendar. Each spots something different.
        </p>
      </div>

      {/* Council Scene with Clickable Hotspots */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-amber-200/50">
        {/* Background Image */}
        <img
          src="/images/thinktank-bg.jpg"
          alt="Hamster Council at round table"
          className="w-full h-auto"
        />

        {/* Clickable Hotspots */}
        {hamsters.map((hamster) => {
          const hotspot = HAMSTER_HOTSPOTS[hamster.id];
          const isHovered = hoveredHamster === hamster.id;
          const isSelected = selectedHamster === hamster.id;

          return (
            <button
              key={hamster.id}
              onClick={() => onSelectHamster(hamster.id)}
              onMouseEnter={() => setHoveredHamster(hamster.id)}
              onMouseLeave={() => setHoveredHamster(null)}
              className="absolute rounded-full transition-all duration-300 cursor-pointer"
              style={{
                top: hotspot.top,
                left: hotspot.left,
                width: hotspot.size,
                height: hotspot.size,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Hover/Selected ring */}
              <div
                className={`absolute inset-0 rounded-full border-4 transition-all duration-300 ${
                  isSelected
                    ? 'border-white scale-115 animate-pulse-ring'
                    : isHovered
                    ? 'border-white/80 scale-110 animate-pulse-ring'
                    : 'border-transparent'
                }`}
                style={{
                  boxShadow: isSelected
                    ? `0 0 40px ${hamster.color}, 0 0 20px ${hamster.color}80`
                    : isHovered
                    ? `0 0 30px ${hamster.color}80`
                    : 'none',
                }}
              />

              {/* Tooltip */}
              {(isHovered || isSelected) && (
                <div
                  className="absolute -top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-white/95 backdrop-blur-sm shadow-lg whitespace-nowrap z-10"
                  style={{ borderColor: hamster.color, borderWidth: 2 }}
                >
                  <div className="font-semibold text-sm" style={{ color: hamster.color }}>
                    {hamster.defaultName}
                  </div>
                  <div className="text-xs text-slate-500">{hamster.school}</div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Hamster Cards - Quick Selection */}
      <div className="grid grid-cols-2 gap-3">
        {hamsters.map((hamster) => (
          <button
            key={hamster.id}
            onClick={() => onSelectHamster(hamster.id)}
            className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 hover:bg-white/90 hover:scale-[1.02] transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{hamster.icon}</span>
              <div>
                <div className="font-semibold text-slate-700 group-hover:text-slate-900">
                  {hamster.defaultName}
                </div>
                <div className="text-xs text-slate-500">{hamster.school}</div>
              </div>
            </div>
            <p className="text-xs text-slate-500">{hamster.description}</p>
            <div
              className="mt-2 px-2 py-1 rounded-full text-xs inline-block"
              style={{ backgroundColor: `${hamster.color}20`, color: hamster.color }}
            >
              {hamster.signatureTool}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Chat Modal Component - Slides up from bottom
function ChatModal({
  hamsterId,
  problem,
  setProblem,
  response,
  isLoading,
  onSubmit,
  onClose,
  toolFields,
  setToolFields,
  onSaveSession,
  showToolComplete,
}: {
  hamsterId: HamsterId;
  problem: string;
  setProblem: (v: string) => void;
  response: string | null;
  isLoading: boolean;
  onSubmit: () => void;
  onClose: () => void;
  toolFields: Record<string, string>;
  setToolFields: (v: Record<string, string>) => void;
  onSaveSession: () => void;
  showToolComplete: boolean;
}) {
  const hamster = getHamster(hamsterId);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const updateToolField = (key: string, value: string) => {
    setToolFields({ ...toolFields, [key]: value });
  };

  const allToolFieldsFilled = hamster.toolFields.every(
    (field) => toolFields[field.key]?.trim()
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-t-3xl shadow-2xl overflow-hidden"
            style={{
              background: `linear-gradient(180deg, ${hamster.color}15 0%, white 20%)`,
            }}
          >
            {/* Header */}
            <div
              className="p-4 flex items-center gap-3 border-b"
              style={{ borderColor: `${hamster.color}30` }}
            >
              <span className="text-3xl">{hamster.icon}</span>
              <div className="flex-1">
                <h2 className="font-bold text-lg" style={{ color: hamster.color }}>
                  {hamster.defaultName}
                </h2>
                <p className="text-xs text-slate-500">{hamster.school} Psychology</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
              {/* Problem Input */}
              {!response && !isLoading && (
                <div>
                  <textarea
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="What's been on your mind lately? Or ask what patterns they see..."
                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent resize-none min-h-[100px]"
                    style={{ '--tw-ring-color': hamster.color } as React.CSSProperties}
                    autoFocus
                  />
                  <Button
                    onClick={onSubmit}
                    disabled={!problem.trim()}
                    className="w-full mt-3 text-white py-3 rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${hamster.color}, ${hamster.color}cc)`,
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Ask {hamster.defaultName}
                  </Button>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="py-8 text-center">
                  <Loader2
                    className="w-8 h-8 animate-spin mx-auto mb-3"
                    style={{ color: hamster.color }}
                  />
                  <p className="text-slate-600">{hamster.defaultName} is thinking...</p>
                </div>
              )}

              {/* Response */}
              {response && !showToolComplete && (
                <div className="space-y-4">
                  {/* What you dumped */}
                  <div className="bg-slate-100 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">You said:</p>
                    <p className="text-slate-700 text-sm">{problem}</p>
                  </div>

                  {/* Hamster Response */}
                  <div
                    className="rounded-xl p-4 border-2"
                    style={{
                      backgroundColor: `${hamster.color}10`,
                      borderColor: `${hamster.color}40`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{hamster.icon}</span>
                      <p className="text-slate-700">{response}</p>
                    </div>
                  </div>

                  {/* Signature Tool */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs text-white"
                        style={{ backgroundColor: hamster.color }}
                      >
                        Tool
                      </span>
                      {hamster.signatureTool}
                    </h3>

                    <div className="space-y-2">
                      {hamster.toolFields.map((field) => (
                        <div key={field.key}>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            {field.label}
                          </label>
                          <input
                            type="text"
                            value={toolFields[field.key] || ''}
                            onChange={(e) => updateToolField(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 text-sm"
                            style={{ '--tw-ring-color': hamster.color } as React.CSSProperties}
                          />
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={onSaveSession}
                      disabled={!allToolFieldsFilled}
                      className="w-full mt-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2.5 rounded-xl text-sm"
                    >
                      Complete & Save
                    </Button>
                  </div>
                </div>
              )}

              {/* Completion State */}
              {showToolComplete && (
                <div className="text-center py-6">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <span className="text-2xl">✓</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Done.</h3>
                  <p className="text-slate-600 text-sm mb-4">
                    That one has somewhere to go now.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="flex-1 rounded-xl"
                    >
                      Done
                    </Button>
                    <Button
                      onClick={() => {
                        setProblem('');
                        onClose();
                      }}
                      className="flex-1 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${hamster.color}, ${hamster.color}cc)`,
                      }}
                    >
                      Another one
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}

// History View Component
function HistoryView({ onBack }: { onBack: () => void }) {
  const sessions = getSessions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-amber-800">Session History</h2>
        <button
          onClick={onBack}
          className="text-amber-600 hover:text-amber-700 text-sm flex items-center gap-1"
        >
          Back to Council <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 text-center">
          <span className="text-4xl mb-3 block">🐹</span>
          <p className="text-slate-600">Nothing here yet. Pick a hamster and dump something.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const hamster = getHamster(session.hamsterId);
            const date = new Date(session.timestamp);

            return (
              <div
                key={session.id}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{hamster.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-slate-700">
                      {hamster.defaultName} - {hamster.signatureTool}
                    </div>
                    <div className="text-xs text-slate-500">
                      {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-slate-600 mb-2">
                  <span className="font-medium">Problem:</span> {session.problem}
                </div>

                <div className="text-sm text-slate-600 mb-2">
                  <span className="font-medium">Response:</span> {session.response}
                </div>

                {Object.keys(session.toolResult).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs font-medium text-slate-500 mb-2">Tool Results:</p>
                    <div className="space-y-1">
                      {Object.entries(session.toolResult).map(([key, value]) => (
                        <div key={key} className="text-xs text-slate-600">
                          <span className="font-medium capitalize">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Council Results Modal
function CouncilModal({
  result,
  isLoading,
  problem,
  onClose,
}: {
  result: CouncilResult | null;
  isLoading: boolean;
  problem: string;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'consensus' | 'individual' | 'rankings'>('consensus');

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 z-50 animate-fade-in flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-500 to-pink-500">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🐹🐹🐹🐹</span>
              <div>
                <h2 className="font-bold text-white">Council Consensus</h2>
                <p className="text-xs text-white/80">4 hamsters deliberated</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Council is deliberating...</h3>
                <p className="text-sm text-slate-500">All 4 hamsters are reviewing your problem</p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && !isLoading && (
            <>
              {/* Problem recap */}
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Your problem:</p>
                <p className="text-sm text-slate-700">{problem}</p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200">
                {(['consensus', 'individual', 'rankings'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50/50'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab === 'consensus' && '✨ Final Answer'}
                    {tab === 'individual' && '🐹 Individual'}
                    {tab === 'rankings' && '📊 Rankings'}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Consensus Tab */}
                {activeTab === 'consensus' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 rounded-full bg-emerald-500 text-white text-xs font-medium">
                          Chairman: {HAMSTER_CONFIG[result.chairmanId].defaultName}
                        </span>
                      </div>
                      <p className="text-slate-700">{result.stage3}</p>
                    </div>

                    {/* Rankings Summary */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200">
                      <h4 className="font-semibold text-slate-700 mb-3">Who gave the best advice?</h4>
                      <div className="space-y-2">
                        {result.aggregateRankings.map((rank, i) => {
                          const hamster = HAMSTER_CONFIG[rank.hamsterId];
                          return (
                            <div key={rank.hamsterId} className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                {i + 1}
                              </span>
                              <span className="text-lg">{hamster.icon}</span>
                              <span className="text-sm font-medium text-slate-700">{rank.hamsterName}</span>
                              <span className="text-xs text-slate-400 ml-auto">
                                avg: {rank.averageRank.toFixed(1)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Individual Tab */}
                {activeTab === 'individual' && (
                  <div className="space-y-3">
                    {result.stage1.map((r) => {
                      const hamster = HAMSTER_CONFIG[r.hamsterId];
                      return (
                        <div
                          key={r.hamsterId}
                          className="p-4 rounded-2xl border-2"
                          style={{ borderColor: `${hamster.color}40`, backgroundColor: `${hamster.color}08` }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{hamster.icon}</span>
                            <span className="font-semibold" style={{ color: hamster.color }}>
                              {hamster.defaultName}
                            </span>
                            <span className="text-xs text-slate-500">{hamster.school}</span>
                          </div>
                          <p className="text-sm text-slate-700">{r.response}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Rankings Tab */}
                {activeTab === 'rankings' && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 italic">
                      Each hamster anonymously reviewed and ranked the others' advice.
                    </p>
                    {result.stage2.map((ranking) => {
                      const hamster = HAMSTER_CONFIG[ranking.hamsterId];
                      return (
                        <div key={ranking.hamsterId} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span>{hamster.icon}</span>
                            <span className="font-medium text-sm text-slate-700">
                              {hamster.defaultName}'s ranking:
                            </span>
                          </div>
                          <div className="pl-6 space-y-1">
                            {ranking.parsedRanking.map((label, i) => {
                              const rankedHamsterId = result.labelToHamster[label];
                              const rankedHamster = rankedHamsterId ? HAMSTER_CONFIG[rankedHamsterId] : null;
                              return (
                                <div key={i} className="text-sm text-slate-600">
                                  {i + 1}. {rankedHamster ? `${rankedHamster.icon} ${rankedHamster.defaultName}` : label}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200">
                <Button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl">
                  Done
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
