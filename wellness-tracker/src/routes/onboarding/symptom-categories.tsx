import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { HEALTH_CONTEXT_DISPLAY, type HealthContext } from '@/lib/adaptive-logging';

// Health contexts for adaptive logging
const healthContexts = [
  {
    id: 'energy_fatigue' as HealthContext,
    display: HEALTH_CONTEXT_DISPLAY.energy_fatigue,
    icon: '⚡',
    color: 'bg-yellow-50 border-yellow-200',
  },
  {
    id: 'digestion' as HealthContext,
    display: HEALTH_CONTEXT_DISPLAY.digestion,
    icon: '🚽',
    color: 'bg-green-50 border-green-200',
  },
  {
    id: 'food_reactions' as HealthContext,
    display: HEALTH_CONTEXT_DISPLAY.food_reactions,
    icon: '🍽️',
    color: 'bg-orange-50 border-orange-200',
  },
  {
    id: 'pain_discomfort' as HealthContext,
    display: HEALTH_CONTEXT_DISPLAY.pain_discomfort,
    icon: '🔥',
    color: 'bg-red-50 border-red-200',
  },
  {
    id: 'sleep_rest' as HealthContext,
    display: HEALTH_CONTEXT_DISPLAY.sleep_rest,
    icon: '🌙',
    color: 'bg-indigo-50 border-indigo-200',
  },
  {
    id: 'focus_mental' as HealthContext,
    display: HEALTH_CONTEXT_DISPLAY.focus_mental,
    icon: '🧠',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    id: 'cycle_rhythms' as HealthContext,
    display: HEALTH_CONTEXT_DISPLAY.cycle_rhythms,
    icon: '🌸',
    color: 'bg-pink-50 border-pink-200',
  },
  {
    id: 'medications_supplements' as HealthContext,
    display: HEALTH_CONTEXT_DISPLAY.medications_supplements,
    icon: '💊',
    color: 'bg-purple-50 border-purple-200',
  },
  {
    id: 'open_tracking' as HealthContext,
    display: HEALTH_CONTEXT_DISPLAY.open_tracking,
    icon: '📝',
    color: 'bg-gray-50 border-gray-200',
  },
];

export const Route = createFileRoute('/onboarding/symptom-categories')({
  component: SymptomCategoriesScreen,
});

function SymptomCategoriesScreen() {
  const [selectedContexts, setSelectedContexts] = useState<HealthContext[]>([]);

  const toggleContext = (contextId: HealthContext) => {
    setSelectedContexts(prev =>
      prev.includes(contextId)
        ? prev.filter(id => id !== contextId)
        : [...prev, contextId]
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-8 px-4">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800">
          Customize what you track (optional)
        </h1>
        <p className="text-gray-600">
          Choose what you'd like to keep an eye on. You can change this anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        {healthContexts.map((context) => (
          <Card
            key={context.id}
            className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedContexts.includes(context.id)
                ? `${context.color} ring-2 ring-pink-300`
                : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => toggleContext(context.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{context.icon}</div>
              {selectedContexts.includes(context.id) && (
                <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <h3 className="font-semibold text-gray-800 mb-2">
              {context.display.name}
            </h3>

            <p className="text-sm text-gray-600 mb-3">
              {context.display.description}
            </p>
          </Card>
        ))}
      </div>

      <div className="flex gap-4 mt-8">
        <Button variant="outline">
          Skip for now
        </Button>
        <Button disabled={selectedContexts.length === 0}>
          Continue ({selectedContexts.length} selected)
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="flex space-x-2 mt-8">
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
}