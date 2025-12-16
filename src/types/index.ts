export interface SkinProfile {
  id: string;
  timestamp: Date;
  score: number;
  concerns: string[];
  skinType: 'dry' | 'oily' | 'combination' | 'sensitive' | 'normal';
  image?: string;
  notes: string[];
}

export interface RoutineStep {
  id: string;
  title: string;
  description: string;
  time: 'morning' | 'evening';
  glowState: 'optimal' | 'recovering' | 'overloaded';
  product?: {
    name: string;
    description: string;
  };
}

export interface GlowMilestone {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  date?: Date;
}

export interface DailyCheckIn {
  date: Date;
  mood: 'happy' | 'neutral' | 'sad';
  notes: string;
  weather?: string;
  sleep?: number;
  stress?: number;
}