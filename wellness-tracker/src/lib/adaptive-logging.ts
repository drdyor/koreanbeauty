import type { HealthContext } from './api/types';

// Re-export for convenience
export type { HealthContext };

// Adaptive module configuration
export interface AdaptiveModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  contexts: HealthContext[];
  defaultVisible: boolean;
  progressiveThreshold?: number; // Show after N uses
}

// Available tracking modules
export const ADAPTIVE_MODULES: AdaptiveModule[] = [
  // Core modules (always available)
  {
    id: 'mood',
    title: 'Mood',
    description: 'How are you feeling today?',
    icon: '😊',
    priority: 'high',
    contexts: [],
    defaultVisible: true,
  },
  {
    id: 'energy',
    title: 'Energy',
    description: 'Track your energy levels',
    icon: '⚡',
    priority: 'high',
    contexts: ['energy_fatigue'],
    defaultVisible: true,
  },
  {
    id: 'sleep',
    title: 'Sleep',
    description: 'Log rest from last night',
    icon: '🌙',
    priority: 'high',
    contexts: ['sleep_rest'],
    defaultVisible: true,
  },
  {
    id: 'nutrition',
    title: 'Nutrition',
    description: 'What did you eat today?',
    icon: '🍽️',
    priority: 'high',
    contexts: ['food_reactions'],
    defaultVisible: true,
  },
  {
    id: 'movement',
    title: 'Movement',
    description: 'Any physical activity today?',
    icon: '🏃‍♀️',
    priority: 'medium',
    contexts: [],
    defaultVisible: true,
  },

  // Adaptive modules (context-aware)
  {
    id: 'digestion',
    title: 'Digestion',
    description: 'Log digestive activity if you want to track it today',
    icon: '🚽',
    priority: 'medium',
    contexts: ['digestion'],
    defaultVisible: false,
    progressiveThreshold: 2,
  },
  {
    id: 'pain',
    title: 'Pain & Discomfort',
    description: 'Log physical sensations if you\'d like',
    icon: '🔥',
    priority: 'medium',
    contexts: ['pain_discomfort'],
    defaultVisible: false,
    progressiveThreshold: 1,
  },
  {
    id: 'focus',
    title: 'Focus & Mental State',
    description: 'How is your concentration today?',
    icon: '🧠',
    priority: 'medium',
    contexts: ['focus_mental'],
    defaultVisible: false,
  },
  {
    id: 'medications',
    title: 'Medications & Supplements',
    description: 'Track what you\'ve taken',
    icon: '💊',
    priority: 'low',
    contexts: ['medications_supplements'],
    defaultVisible: false,
  },
  {
    id: 'cycle',
    title: 'Cycle & Body Rhythms',
    description: 'Note any body changes today',
    icon: '🌸',
    priority: 'low',
    contexts: ['cycle_rhythms'],
    defaultVisible: false,
  },

  // Progressive modules (appear after repeated use)
  {
    id: 'gratitude',
    title: 'Gratitude',
    description: 'What are you thankful for?',
    icon: '🙏',
    priority: 'low',
    contexts: ['focus_mental'],
    defaultVisible: false,
    progressiveThreshold: 3,
  },
  {
    id: 'food_reactions',
    title: 'Food & Reactions',
    description: 'Log what you ate and how it felt, if relevant',
    icon: '🍎',
    priority: 'medium',
    contexts: ['food_reactions'],
    defaultVisible: false,
    progressiveThreshold: 2,
  },
  {
    id: 'progress_photos',
    title: 'Progress Photos',
    description: 'Visual tracking over time',
    icon: '📸',
    priority: 'low',
    contexts: [],
    defaultVisible: false,
    progressiveThreshold: 5,
  },
  {
    id: 'hypnosis',
    title: 'Guided Sessions',
    description: 'Audio wellness sessions',
    icon: '🎧',
    priority: 'low',
    contexts: ['focus_mental'],
    defaultVisible: false,
    progressiveThreshold: 4,
  },
];

// Get visible modules based on user contexts and usage patterns
export function getVisibleModules(
  healthContexts: HealthContext[] = [],
  moduleUsage: Record<string, number> = {}
): AdaptiveModule[] {
  return ADAPTIVE_MODULES
    .map(module => {
      // Always show default modules
      if (module.defaultVisible) {
        return { ...module, visible: true };
      }

      // Show if context matches
      if (module.contexts.length > 0 && module.contexts.some(ctx => healthContexts.includes(ctx))) {
        return { ...module, visible: true };
      }

      // Show if progressive threshold met
      if (module.progressiveThreshold && moduleUsage[module.id] >= module.progressiveThreshold) {
        return { ...module, visible: true };
      }

      return { ...module, visible: false };
    })
    .filter(module => module.visible)
    .sort((a, b) => {
      // Sort by priority, then by usage
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by usage count
      return (moduleUsage[b.id] || 0) - (moduleUsage[a.id] || 0);
    });
}

// Get suggested modules based on recent activity
export function getSuggestedModules(
  healthContexts: HealthContext[] = [],
  recentActivity: string[] = []
): AdaptiveModule[] {
  const visibleModules = getVisibleModules(healthContexts);

  // Suggest modules that are related to recent activity but not frequently used
  return ADAPTIVE_MODULES
    .filter(module => !visibleModules.find(vm => vm.id === module.id))
    .filter(module => {
      // Suggest if related contexts are active
      return module.contexts.some(ctx => healthContexts.includes(ctx));
    })
    .slice(0, 2); // Max 2 suggestions
}

// Health context display names (neutral language)
export const HEALTH_CONTEXT_DISPLAY: Record<HealthContext, { name: string; description: string }> = {
  energy_fatigue: {
    name: 'Energy & fatigue',
    description: 'Track energy levels and fatigue patterns'
  },
  digestion: {
    name: 'Digestion',
    description: 'Monitor digestive activity and patterns'
  },
  food_reactions: {
    name: 'Food & reactions',
    description: 'Note foods and how your body responds'
  },
  pain_discomfort: {
    name: 'Pain & discomfort',
    description: 'Track physical sensations and discomfort'
  },
  sleep_rest: {
    name: 'Sleep & rest',
    description: 'Monitor sleep quality and rest patterns'
  },
  focus_mental: {
    name: 'Focus & mental state',
    description: 'Track concentration and mental clarity'
  },
  cycle_rhythms: {
    name: 'Cycle & body rhythms',
    description: 'Note body changes and rhythms'
  },
  medications_supplements: {
    name: 'Medications & supplements',
    description: 'Track what you take and when'
  },
  open_tracking: {
    name: 'Open tracking',
    description: 'Keep notes about anything you notice'
  }
};