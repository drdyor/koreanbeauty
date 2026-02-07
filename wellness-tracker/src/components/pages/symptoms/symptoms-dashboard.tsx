import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, TrendingUp, Pill, Plus, Check, Sparkles, Brain, Moon, Utensils, Activity, ChevronRight } from 'lucide-react';
import { SymptomEntryForm } from './symptom-entry-form';
import { SymptomHistory } from './symptom-history';
import { PatternAnalysis } from './pattern-analysis';
import { MedicationTracker } from './medication-tracker';
import { getVisibleModules, getSuggestedModules, type AdaptiveModule } from '@/lib/adaptive-logging';
import { useWellnessPreferences } from '@/hooks/api/use-wellness';

export function SymptomsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: preferences } = useWellnessPreferences('current-user');

  // Get adaptive modules based on user contexts
  const visibleModules = getVisibleModules(
    preferences?.healthContexts || [],
    {}
  );

  const suggestedModules = getSuggestedModules(
    preferences?.healthContexts || [],
    []
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                Your Wellness Hub
              </h1>
              <p className="text-purple-600/70 text-sm">
                Track what matters to you. Your logs help you notice patterns over time.
              </p>
            </div>
          </div>
        </div>

        {/* Today's Check-ins */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-purple-900 mb-4">Today's Check-ins</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleModules.slice(0, 6).map((module) => (
              <Card
                key={module.id}
                className="bg-white/70 backdrop-blur-sm border border-purple-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => {
                  console.log(`Navigate to ${module.id}`);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{module.icon}</span>
                    <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-3 h-3 text-pink-600" />
                    </div>
                  </div>
                  <h3 className="font-medium text-purple-900 mb-1">{module.title}</h3>
                  <p className="text-sm text-purple-600/70">{module.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        {suggestedModules.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-purple-900 mb-4">Available Today</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {suggestedModules.map((module) => (
                <Card key={module.id} className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-3">{module.icon}</span>
                          <h3 className="font-medium text-purple-900">{module.title}</h3>
                        </div>
                        <p className="text-sm text-purple-700 mb-3">{module.description}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-pink-300 text-pink-700 hover:bg-pink-100"
                          onClick={() => {
                            console.log(`Enable ${module.id}`);
                          }}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Add to check-ins
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Additional Tools */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-purple-900 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center mr-3">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                Your Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-600/70 mb-4">
                Review your entries together over time to notice what appears.
              </p>
              <Button
                variant="outline"
                className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                View Patterns
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-purple-900 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center mr-3">
                  <Pill className="w-4 h-4 text-white" />
                </div>
                Medications & Supplements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-600/70 mb-4">
                Track what you take and when, if relevant to your check-ins.
              </p>
              <Button
                variant="outline"
                className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                Manage Medications
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Log Buttons */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-purple-900 mb-4">Quick Log</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Heart, label: 'Mood', color: 'from-pink-400 to-rose-400', emoji: '💗' },
              { icon: Moon, label: 'Sleep', color: 'from-indigo-400 to-purple-400', emoji: '🌙' },
              { icon: Utensils, label: 'Food', color: 'from-amber-400 to-orange-400', emoji: '🍽️' },
              { icon: Activity, label: 'Energy', color: 'from-emerald-400 to-teal-400', emoji: '⚡' },
            ].map((item, index) => (
              <button
                key={index}
                className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all group text-left"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium text-purple-900">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Entries */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-purple-900">Recent Entries</h2>
            <button className="text-purple-500 hover:text-purple-700 text-sm flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm p-4">
            <SymptomHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
