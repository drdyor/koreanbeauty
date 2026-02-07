// Type definitions for the Self-Hypnosis Behavioral Rewiring App

export const MODES = {
  WAKE: 'wake',
  SLEEP: 'sleep'
};

export const FEAR_PATTERN_IDS = {
  AVOIDANCE: 'avoidance',
  CONTROL: 'control',
  SUBMISSION: 'submission',
  AUTHORITY_FEAR: 'authority_fear',
  PERFECTIONISM: 'perfectionism',
  ABANDONMENT: 'abandonment',
  REJECTION: 'rejection',
  INADEQUACY: 'inadequacy'
};

export const THERAPY_MODULES = {
  FEAR_PATTERN_FORM: 'fear_pattern_form',
  SOMATIC_EXPERIENCING: 'somatic_experiencing',
  POLYVAGAL_EXERCISES: 'polyvagal_exercises',
  IFS_JOURNALING: 'ifs_journaling',
  CBT_EXERCISES: 'cbt_exercises',
  CARTESIAN_REFLECTION: 'cartesian_reflection'
};

export const AUDIO_TYPES = {
  SUBLIMINAL: 'subliminal',
  BINAURAL: 'binaural',
  DELTA_WAVE: 'delta_wave',
  THETA_WAVE: 'theta_wave',
  RIFE_FREQUENCY: 'rife_frequency'
};

export const NERVOUS_SYSTEM_STATES = {
  VENTRAL_VAGAL: 'ventral_vagal',
  SYMPATHETIC: 'sympathetic',
  DORSAL_VAGAL: 'dorsal_vagal'
};

// Default user profile structure
export const DEFAULT_USER_PROFILE = {
  fearPatterns: [],
  progress: {},
  preferences: {
    audioVolume: 0.5,
    sessionDuration: 30,
    preferredVoice: 'neutral',
    darkMode: false
  },
  sessionHistory: [],
  currentNervousSystemState: NERVOUS_SYSTEM_STATES.VENTRAL_VAGAL
};

// Validation functions
export const isValidMode = (mode) => Object.values(MODES).includes(mode);
export const isValidFearPattern = (pattern) => Object.values(FEAR_PATTERN_IDS).includes(pattern);
export const isValidTherapyModule = (module) => Object.values(THERAPY_MODULES).includes(module);

