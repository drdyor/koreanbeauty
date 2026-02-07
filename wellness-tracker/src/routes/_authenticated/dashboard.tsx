import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Heart,
  TrendingUp,
  Pill,
  Calendar,
  Clock,
  Sparkles,
  Activity,
  Brain,
  Moon,
  Utensils,
  ChevronRight,
  Plus,
  AlertCircle,
} from 'lucide-react';

// Get user preferences from localStorage
function getUserPreferences() {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('glowchi-preferences');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
});

// Mock data for recent symptoms
const recentSymptoms = [
  { name: 'Headache', category: 'Mental', severity: 'severe', time: '2 hours ago' },
  { name: 'Anxiety', category: 'Mental', severity: 'moderate', time: '4 hours ago' },
  { name: 'Fatigue', category: 'Physical', severity: 'mild', time: '6 hours ago' },
];

// Mock data for pattern insights
const patternInsights = [
  {
    title: 'Anxiety peaks with caffeine',
    description: 'Your anxiety levels are 2.3x higher on days with 3+ caffeinated drinks',
    tags: ['Correlation', '85% confidence'],
    type: 'correlation',
  },
  {
    title: 'Headache frequency decreasing',
    description: 'Headache occurrences have dropped 40% over the last 2 weeks',
    tags: ['Trend', 'Positive'],
    type: 'positive',
  },
];

// Mock data for medications
const medications = [
  {
    name: 'Sertraline',
    dosage: '50mg',
    frequency: 'Once daily',
    purpose: 'Anxiety & depression',
    adherence: 95,
    effectiveness: 7,
    icon: '💊',
  },
  {
    name: 'Vitamin D3',
    dosage: '2000 IU',
    frequency: 'Once daily',
    purpose: 'Energy & immunity',
    adherence: 88,
    effectiveness: 8,
    icon: '☀️',
  },
];

// Stats data
const stats = [
  { label: "Today's Entries", value: 3, color: 'text-pink-500' },
  { label: 'Active Patterns', value: 5, color: 'text-purple-500' },
  { label: 'Medications', value: 2, color: 'text-blue-500' },
  { label: 'This Week', value: 12, color: 'text-emerald-500' },
];

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'severe': return 'bg-red-100 text-red-700 border-red-200';
    case 'moderate': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'mild': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

function DashboardPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                Wellness Dashboard
              </h1>
              <p className="text-purple-600/70 text-sm">
                Comprehensive wellness and symptom tracking for better health insights
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-purple-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-purple-600/70 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Symptoms */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-purple-900">Recent Symptoms</h2>
                <p className="text-purple-500 text-sm">Your latest wellness check-ins</p>
              </div>
              <Link
                to="/symptoms"
                className="text-purple-500 hover:text-purple-700 text-sm flex items-center gap-1"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentSymptoms.map((symptom, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-purple-50/50 rounded-xl border border-purple-100/50"
                >
                  <div>
                    <div className="font-medium text-purple-900">{symptom.name}</div>
                    <div className="text-sm text-purple-500">{symptom.category} • {symptom.time}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(symptom.severity)}`}>
                    {symptom.severity.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-2.5 rounded-xl border-2 border-dashed border-purple-200 text-purple-500 hover:bg-purple-50 hover:border-purple-300 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Log New Symptom
            </button>
          </div>

          {/* Pattern Insights */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-purple-900">Pattern Insights</h2>
                <p className="text-purple-500 text-sm">AI-powered wellness discoveries</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="space-y-4">
              {patternInsights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border-l-4 border-violet-400"
                >
                  <h3 className="font-medium text-purple-900 mb-1">{insight.title}</h3>
                  <p className="text-sm text-purple-600 mb-3">{insight.description}</p>
                  <div className="flex gap-2">
                    {insight.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          insight.type === 'positive'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/symptoms"
              className="block w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-center font-medium hover:from-violet-600 hover:to-purple-600 transition-all shadow-sm"
            >
              View All Patterns
            </Link>
          </div>

          {/* Medication Tracking */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-purple-900">Medication Tracking</h2>
                <p className="text-purple-500 text-sm">Monitor effectiveness and side effects</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                <Pill className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="space-y-4">
              {medications.map((med, index) => (
                <div
                  key={index}
                  className="p-4 bg-pink-50/50 rounded-xl border border-pink-100"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{med.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-purple-900">{med.name}</h3>
                      <p className="text-sm text-purple-500">{med.dosage} • {med.frequency} • {med.purpose}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-600">Adherence</span>
                      <span className="text-sm font-semibold text-emerald-600">{med.adherence}%</span>
                    </div>
                    <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                        style={{ width: `${med.adherence}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-purple-600">Effectiveness</span>
                      <span className="text-sm font-semibold text-blue-600">{med.effectiveness}/10</span>
                    </div>
                    <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                        style={{ width: `${med.effectiveness * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-2.5 rounded-xl border-2 border-dashed border-pink-200 text-pink-500 hover:bg-pink-50 hover:border-pink-300 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Add Medication
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Heart, label: 'Log Mood', color: 'from-pink-400 to-rose-400' },
            { icon: Moon, label: 'Sleep Entry', color: 'from-indigo-400 to-purple-400' },
            { icon: Utensils, label: 'Food Diary', color: 'from-amber-400 to-orange-400' },
            { icon: Activity, label: 'Exercise', color: 'from-emerald-400 to-teal-400' },
          ].map((action, index) => (
            <button
              key={index}
              className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="font-medium text-purple-900">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Weekly Summary */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Weekly Summary</h2>
              <p className="text-white/80 text-sm">Jan 10 - Jan 16, 2026</p>
            </div>
            <Calendar className="w-6 h-6 text-white/80" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">12</div>
              <div className="text-white/80 text-sm">Total Entries</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">7.2</div>
              <div className="text-white/80 text-sm">Avg Mood</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">6.5h</div>
              <div className="text-white/80 text-sm">Avg Sleep</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">92%</div>
              <div className="text-white/80 text-sm">Med Adherence</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
