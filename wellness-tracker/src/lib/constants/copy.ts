// Regulatory-safe copy constants for Glowchi
// All text has been reviewed to avoid medical claims, condition names, and interpretive language

export const COPY = {
  // Navigation & Headers
  APP_NAME: 'Wellness Tracker',
  WELCOME_TITLE: 'Your wellness companion',
  DASHBOARD_TITLE: 'Your Wellness Hub',

  // Onboarding
  ONBOARDING_WELCOME_SUBTITLE: 'Choose what you\'d like to keep an eye on. You can change this anytime.',
  ONBOARDING_CONTEXT_TITLE: 'Customize what you track (optional)',
  ONBOARDING_SKIP: 'Skip for now',
  ONBOARDING_CONTINUE: 'Continue',

  // Module descriptions (neutral language)
  MOOD_DESCRIPTION: 'How are you feeling today?',
  ENERGY_DESCRIPTION: 'Track your energy levels',
  SLEEP_DESCRIPTION: 'Log rest from last night',
  NUTRITION_DESCRIPTION: 'What did you eat today?',
  MOVEMENT_DESCRIPTION: 'Any physical activity today?',
  DIGESTION_DESCRIPTION: 'Log digestive activity if you want to track it today',
  PAIN_DESCRIPTION: 'Log physical sensations if you\'d like',
  FOCUS_DESCRIPTION: 'How is your concentration today?',
  MEDICATIONS_DESCRIPTION: 'Track what you take',
  CYCLE_DESCRIPTION: 'Note any body changes today',
  GRATITUDE_DESCRIPTION: 'What are you thankful for?',
  FOOD_REACTIONS_DESCRIPTION: 'Log what you ate and how it felt, if relevant',
  PHOTOS_DESCRIPTION: 'Visual tracking over time',
  HYPNOSIS_DESCRIPTION: 'Audio wellness sessions',

  // Button labels
  LOG_ENTRY: 'Log Entry',
  VIEW_PATTERNS: 'View Patterns',
  ADD_TO_CHECKINS: 'Add to check-ins',
  START_TRACKING: 'Get started',

  // Status messages
  MODULE_AVAILABLE: 'Available today',
  OPTIONAL_CHECKIN: 'Optional check-in',
  TODAY_ENTRY: 'Today\'s entry',

  // Pattern analysis (neutral)
  PATTERNS_DESCRIPTION: 'Review your entries together over time to notice what appears',
  ENTRIES_OVER_TIME: 'Your entries over time',
  FREQUENTLY_LOGGED: 'Frequently logged together',
  APPEARED_TOGETHER: 'Appeared together',
  MORE_COMMON_DURING: 'More common during this period',

  // General UI
  SAVE: 'Save',
  CANCEL: 'Cancel',
  EDIT: 'Edit',
  DELETE: 'Delete',
  CLOSE: 'Close',
  BACK: 'Back',
  NEXT: 'Next',
  PREVIOUS: 'Previous',

  // Form labels (neutral)
  NOTES: 'Notes',
  DATE: 'Date',
  TIME: 'Time',
  VALUE: 'Value',
  RATING: 'Rating',

  // Error messages
  REQUIRED_FIELD: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  SAVE_SUCCESS: 'Saved successfully',
  SAVE_ERROR: 'Failed to save',

  // Empty states
  NO_ENTRIES: 'No entries yet',
  NO_DATA: 'No data available',

  // Time periods
  TODAY: 'Today',
  YESTERDAY: 'Yesterday',
  THIS_WEEK: 'This week',
  THIS_MONTH: 'This month',
  LAST_7_DAYS: 'Last 7 days',
  LAST_30_DAYS: 'Last 30 days',
} as const;

// Banned words list for validation (development only)
export const BANNED_WORDS = [
  // Medical conditions
  'disease', 'disorder', 'syndrome', 'illness', 'diagnosis', 'diagnosed',
  'chronic', 'acute', 'autoimmune', 'inflammatory', 'infection',
  'migraine', 'depression', 'anxiety', 'adhd', 'add', 'ocd', 'ptsd',
  'fibromyalgia', 'arthritis', 'cancer', 'diabetes', 'hypertension',

  // Treatment language
  'treat', 'prevent', 'cure', 'heal', 'reduce', 'improve', 'manage',
  'alleviate', 'relieve', 'control', 'therapy', 'protocol', 'regimen',

  // Causal claims
  'leads to', 'results in', 'causes', 'indicates', 'suggests',
  'linked to', 'associated with', 'risk factor', 'warning sign',

  // Medical targeting
  'for people with', 'common in', 'typical of', 'patients',
  'symptom tracking for',

  // Optimization claims
  'optimize', 'optimize health', 'improve health', 'better health',
  'healthier', 'ideal', 'normal', 'abnormal', 'balanced', 'unbalanced',

  // Advisory language
  'you should', 'you need to', 'you must', 'we recommend',
  'it\'s important to', 'best practice',

  // Comparative interpretation
  'low/high', 'too much', 'too little', 'concerning',
] as const;