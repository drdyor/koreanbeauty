// GLOWCHI Constants

export const Colors = {
  primary: {
    pink: '#FF6FAE',
    rose: '#FF5994',
    purple: '#A855F7',
    lavender: '#E9D5FF',
  },
  background: {
    main: '#FFFFFF',
    soft: '#FFF5F7',
    gradient: ['#FFF5F7', '#FAE8FF', '#FFFFFF'] as const,
  },
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    muted: '#9CA3AF',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#FF6FAE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Health Thresholds
export const HEALTH_TARGETS = {
  steps: {
    excellent: 10000,
    good: 7000,
    fair: 5000,
  },
  sleep: {
    optimal: { min: 7, max: 9 },
    acceptable: { min: 6, max: 10 },
  },
  water: {
    target: 8, // glasses per day
  },
  hrv: {
    good: 50,
    fair: 30,
  },
};

// Pet Level System
export const PET_LEVELS = {
  maxLevel: 99,
  experiencePerLevel: 100,
  streakBonus: 20, // extra XP for maintaining streak
};

// Mood Emojis
export const MOOD_EMOJIS: Record<string, string> = {
  happy: '😊',
  neutral: '😐',
  sluggish: '😴',
  stressed: '😰',
  sick: '🤢',
  glowing: '✨',
  foggy: '🌫️',
  overwhelmed: '😵',
  blocked: '🚫',
  'low-battery': '🪫',
  hidden: '🙈',
  spark: '⚡',
  clingy: '🤗',
  order: '📋',
};

// Food Categories
export const FOOD_CATEGORIES = [
  { id: 'dairy', emoji: '🥛', label: 'Dairy', impact: 'negative' },
  { id: 'sugar', emoji: '🍰', label: 'Sugar', impact: 'negative' },
  { id: 'fried', emoji: '🍟', label: 'Fried', impact: 'negative' },
  { id: 'alcohol', emoji: '🍷', label: 'Alcohol', impact: 'negative' },
  { id: 'caffeine', emoji: '☕', label: 'Caffeine', impact: 'neutral' },
  { id: 'vegetables', emoji: '🥗', label: 'Veggies', impact: 'positive' },
] as const;

// Check-in Times
export const CHECK_IN_TIMES = {
  morning: { start: 6, end: 12 }, // 6 AM - 12 PM
  evening: { start: 18, end: 23 }, // 6 PM - 11 PM
};
