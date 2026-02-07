// Core Types for GLOWCHI App

export type PetMood = 
  | 'happy' 
  | 'neutral' 
  | 'sluggish' 
  | 'stressed' 
  | 'sick' 
  | 'glowing'
  | 'foggy'
  | 'overwhelmed'
  | 'blocked'
  | 'low-battery'
  | 'hidden'
  | 'spark'
  | 'clingy'
  | 'order';

export interface HealthData {
  steps: number;
  sleepHours: number;
  waterIntake: number; // glasses
  hrv?: number; // Heart Rate Variability (from wearables)
  restingHR?: number; // Resting Heart Rate
  activeMinutes?: number;
}

export interface FoodLog {
  date: string; // ISO date string
  categories: {
    dairy: boolean;
    sugar: boolean;
    fried: boolean;
    alcohol: boolean;
    caffeine: boolean;
    vegetables: boolean;
  };
}

export interface PetState {
  mood: PetMood;
  energy: number; // 0-100
  skinClarity: number; // 0-100
  breakoutRisk: number; // 0-100
  happiness: number; // 0-100
  level: number; // 1-99
  experience: number; // points to next level
  streak: number; // consecutive days checked in
  lastFed?: Date;
  darkCircles?: boolean;
  shieldActive?: boolean;
}

export interface UserProfile {
  openId: string;
  name: string;
  email?: string;
  cycleDay?: number; // day in menstrual cycle (1-28)
  cycleLength?: number; // average cycle length
  skinType?: 'dry' | 'oily' | 'combination' | 'sensitive' | 'normal';
  skinConcerns?: string[]; // ['acne', 'hyperpigmentation', 'aging', etc]
  onboardingComplete: boolean;
}

export interface DailyCheckIn {
  date: string; // ISO date string
  health: HealthData;
  food?: FoodLog;
  mood?: string;
  skinPhoto?: string; // base64 or URI
  notes?: string;
}

export interface SkinAnalysis {
  date: string;
  hydration: number; // 0-100
  redness: number; // 0-100
  breakouts: number; // count
  poreSize: number; // 0-100
  darkSpots: number; // count
  overallScore: number; // 0-100
  photoUri: string;
  glowVisionUri?: string; // AI-beautified version
}

export interface Correlation {
  trigger: string; // e.g., "dairy", "< 6h sleep", "high stress"
  impact: 'positive' | 'negative';
  strength: number; // 0-100, confidence level
  occurrences: number; // how many times observed
  lastSeen: string; // ISO date
}

// Think Tank Types
export type HamsterId = 1 | 2 | 3 | 4;

export interface ThinkTankSession {
  id: string;
  hamsterId: HamsterId;
  problem: string;
  toolUsed: string;
  toolResult: Record<string, string>;
  hamsterResponse: string;
  timestamp: string;
  nibblesEarned: number;
}

// =============================================================================
// Roundtable Investigation Types (Deep Dive Mode)
// =============================================================================

export type ThreadId = 'pragmatic' | 'psychological' | 'analytical' | 'social';

export type RoundNumber = 1 | 2 | 3 | 4;

export type ExchangeType = 'probe' | 'follow_up' | 'interrupt' | 'sulk' | 'debate' | 'user_answer';

export interface Thread {
  id: ThreadId;
  hamsterId: HamsterId;
  active: boolean;
  depth: number;           // 0-3, depth 3 = hypothesis ready
  answers: string[];       // User's answers to this thread
  ignored: number;         // Rounds ignored (triggers sulking at 3)
}

export interface Exchange {
  id: string;
  round: RoundNumber;
  hamsterId: HamsterId;
  type: ExchangeType;
  content: string;
  userAnswer: string | null;
  timestamp: string;
}

export interface Hypothesis {
  threadId: ThreadId;
  hamsterId: HamsterId;
  title: string;           // "The Rocky Hypothesis"
  diagnosis: string;       // "You're under-capitalized and over-cautious"
  test: string;            // "The Dubai Recon Trip"
  consequence: string;     // "If you don't book it, you're lying to yourself"
}

export interface ThreadProfile {
  pragmatic: number;       // 0-100 percentage
  psychological: number;
  analytical: number;
  social: number;
  dominant: ThreadId;
  secondary: ThreadId | null;
  interpretation: string;  // "You're 70% Rocky-profile, 30% Erik-profile. Here's what that tension means..."
}

export interface RoundtableSession {
  id: string;
  problem: string;
  round: RoundNumber;
  threads: Record<ThreadId, Thread>;

  // Round history
  exchanges: Exchange[];

  // Current state
  awaitingAnswerFrom: HamsterId | null;
  debateInProgress: boolean;

  // Final output
  hypotheses: Hypothesis[] | null;
  selectedHypothesis: ThreadId | null;
  threadProfile: ThreadProfile | null;

  // Metadata
  createdAt: string;
  updatedAt: string;
  isComplete: boolean;
  isPaused: boolean;
}

// Thread to Hamster mapping
export const THREAD_HAMSTER_MAP: Record<ThreadId, HamsterId> = {
  social: 1,        // Al - Adlerian
  psychological: 2, // Erik - Eriksonian
  analytical: 3,    // Cogni - CBT
  pragmatic: 4,     // Rocky - Behavioral
};

export const HAMSTER_THREAD_MAP: Record<HamsterId, ThreadId> = {
  1: 'social',
  2: 'psychological',
  3: 'analytical',
  4: 'pragmatic',
};

// Thread colors
export const THREAD_COLORS: Record<ThreadId, string> = {
  pragmatic: '#F39C12',    // Orange - Rocky
  psychological: '#3498DB', // Blue - Erik
  analytical: '#2ECC71',    // Green - Cogni
  social: '#E74C3C',        // Red - Al
};
