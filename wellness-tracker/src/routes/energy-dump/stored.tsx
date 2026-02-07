import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { ChevronLeft, Package, Trash2, Eye, EyeOff, Sparkles } from 'lucide-react';

export const Route = createFileRoute('/energy-dump/stored')({
  component: StoredEnergyPage,
});

interface StoredEntry {
  id: number;
  drains: string[];
  storedAt: string;
  unpacked: boolean;
}

function StoredEnergyPage() {
  const [entries, setEntries] = useState<StoredEntry[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('glowchi-energy-drains') || '[]');
    setEntries(stored);
  }, []);

  const deleteEntry = (id: number) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem('glowchi-energy-drains', JSON.stringify(updated));
  };

  const markUnpacked = (id: number) => {
    const updated = entries.map(e =>
      e.id === id ? { ...e, unpacked: true } : e
    );
    setEntries(updated);
    localStorage.setItem('glowchi-energy-drains', JSON.stringify(updated));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-50 to-purple-100">
      {/* Header */}
      <header className="pt-6 pb-4 px-5">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-4">
            <Link
              to="/energy-dump"
              className="p-2 rounded-xl bg-white/60 text-purple-600 hover:bg-white/80 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-purple-900">Stored Worries</h1>
              <p className="text-sm text-purple-600/70">Your guardian cat is watching over these</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-5 pb-8">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Guardian Cat */}
          <div className="text-center">
            <img
              src="/images/mental-load-3.jpg"
              alt="Guardian cat"
              className="w-48 h-auto mx-auto rounded-2xl shadow-lg"
            />
            <p className="text-sm text-purple-500 mt-2 italic">
              "I'll keep them safe until you're ready"
            </p>
          </div>

          {/* Entries List */}
          {entries.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center border border-purple-100">
              <Package className="w-12 h-12 text-purple-300 mx-auto mb-3" />
              <h3 className="font-semibold text-purple-900 mb-2">No stored worries</h3>
              <p className="text-purple-600/70 text-sm mb-4">
                When you need to put something aside, your guardian cat will keep it safe here.
              </p>
              <Link
                to="/energy-dump"
                className="inline-block px-5 py-2 bg-purple-500 text-white rounded-full text-sm font-medium hover:bg-purple-600 transition-colors"
              >
                Store Something
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`bg-white/70 backdrop-blur-sm rounded-2xl border overflow-hidden transition-all ${
                    entry.unpacked ? 'border-emerald-200' : 'border-purple-100'
                  }`}
                >
                  {/* Entry Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        entry.unpacked
                          ? 'bg-emerald-100'
                          : 'bg-purple-100'
                      }`}>
                        {entry.unpacked ? (
                          <Sparkles className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Package className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-purple-900">
                          {entry.drains.length} item{entry.drains.length > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-purple-500">{formatDate(entry.storedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                        className="p-2 text-purple-400 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                      >
                        {expandedId === entry.id ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedId === entry.id && (
                    <div className="px-4 pb-4 border-t border-purple-100/50">
                      <div className="pt-3 space-y-2">
                        {entry.drains.map((drain, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 bg-purple-50/50 rounded-lg text-sm text-purple-700"
                          >
                            {drain}
                          </div>
                        ))}
                      </div>
                      {!entry.unpacked && (
                        <button
                          onClick={() => markUnpacked(entry.id)}
                          className="w-full mt-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                        >
                          Mark as Addressed
                        </button>
                      )}
                      {entry.unpacked && (
                        <div className="mt-4 text-center text-sm text-emerald-600 font-medium">
                          You've addressed these items
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Back to Dump */}
          <Link
            to="/energy-dump"
            className="block w-full py-3 text-center text-purple-600 hover:bg-purple-100/50 rounded-xl transition-colors"
          >
            Store more worries
          </Link>
        </div>
      </div>
    </div>
  );
}
