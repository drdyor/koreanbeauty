import { z } from 'zod';

// Symptom Categories
export const SymptomCategorySchema = z.enum([
  'mental',
  'physical',
  'hormonal',
  'medication',
  'lifestyle'
]);

export type SymptomCategory = z.infer<typeof SymptomCategorySchema>;

// Symptom Severity Levels
export const SymptomSeveritySchema = z.enum([
  'mild',
  'moderate',
  'severe',
  'critical'
]);

export type SymptomSeverity = z.infer<typeof SymptomSeveritySchema>;

// Dashboard Types
export const DashboardStatsSchema = z.object({
  total_users: z.object({
    count: z.number(),
    weekly_growth: z.number().optional()
  }),
  total_api_calls: z.object({ count: z.number() }),
  active_conn: z.number().optional(),
  data_points: z.object({
    top_series_types: z.array(z.object({
      name: z.string(),
      count: z.number(),
      color: z.string()
    })),
    top_workout_types: z.array(z.object({
      name: z.string(),
      count: z.number(),
      color: z.string()
    }))
  })
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

// User Types
export const UserReadSchema = z.object({
  id: z.string(),
  email: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  external_user_id: z.string().optional(),
  created_at: z.string()
});

export type UserRead = z.infer<typeof UserReadSchema>;

// Symptom Entry
export const SymptomEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  category: SymptomCategorySchema,
  symptomType: z.string(),
  severity: z.union([
    z.number().min(1).max(10),
    z.enum(['mild', 'moderate', 'severe', 'critical'])
  ]),
  notes: z.string().optional(),
  timestamp: z.date(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  context: z.object({
    weather: z.string().optional(),
    recentMeals: z.array(z.string()).optional(),
    sleepQuality: z.number().min(1).max(10).optional(),
    stressLevel: z.number().min(1).max(10).optional(),
    medicationTaken: z.array(z.string()).optional(),
  }).optional(),
  photos: z.array(z.string()).optional(),
});

export type SymptomEntry = z.infer<typeof SymptomEntrySchema>;

// Medication Tracking
export const MedicationEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  purpose: z.string(),
  sideEffects: z.array(z.object({
    symptom: z.string(),
    severity: SymptomSeveritySchema,
    date: z.date(),
    notes: z.string().optional(),
  })).optional(),
});

export type MedicationEntry = z.infer<typeof MedicationEntrySchema>;

// Pattern Insight
export const PatternInsightSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['correlation', 'trend', 'prediction', 'anomaly']),
  title: z.string(),
  description: z.string(),
  confidence: z.number().min(0).max(1),
  relatedSymptoms: z.array(z.string()),
  timeframe: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
  actionable: z.boolean(),
  suggestion: z.string().optional(),
  data: z.record(z.string(), z.any()),
});

export type PatternInsight = z.infer<typeof PatternInsightSchema>;

// Healthcare Provider
export const HealthcareProviderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  specialty: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  sharedData: z.array(z.string()), // symptom categories shared
  lastShared: z.date().optional(),
});

export type HealthcareProvider = z.infer<typeof HealthcareProviderSchema>;

// Wellness Report
export const WellnessReportSchema = z.object({
  id: z.string(),
  userId: z.string(),
  dateRange: z.object({
    start: z.date(),
    end: z.date(),
  }),
  symptoms: z.array(SymptomEntrySchema),
  patterns: z.array(PatternInsightSchema),
  medications: z.array(MedicationEntrySchema),
  correlations: z.array(z.object({
    factor1: z.string(),
    factor2: z.string(),
    correlation: z.number(),
    significance: z.string(),
  })),
  summary: z.object({
    overallWellness: z.number().min(1).max(10),
    topSymptoms: z.array(z.string()),
    keyInsights: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  pdfUrl: z.string().optional(),
  sharedWith: z.array(z.string()), // provider IDs
});

export type WellnessReport = z.infer<typeof WellnessReportSchema>;

// Health Context (Adaptive Logging)
export const HealthContextSchema = z.enum([
  'energy_fatigue',
  'digestion',
  'food_reactions',
  'pain_discomfort',
  'sleep_rest',
  'focus_mental',
  'cycle_rhythms',
  'medications_supplements',
  'open_tracking'
]);

export type HealthContext = z.infer<typeof HealthContextSchema>;

// User Wellness Preferences
export const WellnessPreferencesSchema = z.object({
  selectedCategories: z.array(SymptomCategorySchema),
  healthContexts: z.array(HealthContextSchema).optional(),
  trackingFrequency: z.enum(['daily', 'symptom-based', 'weekly', 'custom']),
  reminderTimes: z.array(z.string()), // HH:MM format
  healthcareSharing: z.boolean(),
  dataRetention: z.enum(['1year', '2years', 'forever']),
  exportFormats: z.array(z.enum(['pdf', 'csv', 'json'])),
});

export type WellnessPreferences = z.infer<typeof WellnessPreferencesSchema>;

// API Response Types
export interface SymptomEntriesResponse {
  entries: SymptomEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface PatternAnalysisResponse {
  insights: PatternInsight[];
  correlations: Array<{
    factor1: string;
    factor2: string;
    correlation: number;
    significance: string;
  }>;
  trends: Array<{
    symptom: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    changePercent: number;
  }>;
}

export interface WellnessDashboardResponse {
  todaysEntries: SymptomEntry[];
  recentPatterns: PatternInsight[];
  upcomingReminders: Array<{
    id: string;
    type: 'check-in' | 'medication' | 'follow-up';
    title: string;
    time: string;
  }>;
  wellnessScore: number;
  streakDays: number;
}

// Additional types needed by components

// Auth types
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  user: UserReadSchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const RegisterResponseSchema = z.object({
  user: UserReadSchema,
  access_token: z.string(),
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

export const ResetPasswordRequestSchema = z.object({
  token: z.string(),
  password: z.string(),
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

// User management types
export const UserCreateSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  external_user_id: z.string().optional(),
});

export type UserCreate = z.infer<typeof UserCreateSchema>;

export const UserUpdateSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
});

export type UserUpdate = z.infer<typeof UserUpdateSchema>;

export const UserQueryParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  email: z.string().optional(),
  external_user_id: z.string().optional(),
});

export type UserQueryParams = z.infer<typeof UserQueryParamsSchema>;

export const PaginatedUsersResponseSchema = z.object({
  users: z.array(UserReadSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    hasMore: z.boolean(),
  }),
});

export type PaginatedUsersResponse = z.infer<typeof PaginatedUsersResponseSchema>;

// Provider types
export const ProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['oauth', 'api_key', 'webhook']),
  is_active: z.boolean(),
  config: z.record(z.string(), z.any()),
  created_at: z.string(),
  updated_at: z.string(),
  provider: z.string().optional(),
  is_enabled: z.boolean().optional(),
  icon_url: z.string().optional(),
});

export type Provider = z.infer<typeof ProviderSchema>;

// API Key types
export const ApiKeySchema = z.object({
  id: z.string(),
  provider_id: z.string(),
  name: z.string(),
  key_preview: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  last_used: z.string().optional(),
});

export type ApiKey = z.infer<typeof ApiKeySchema>;

export const ApiKeyCreateSchema = z.object({
  provider_id: z.string(),
  name: z.string(),
  key: z.string(),
});

export type ApiKeyCreate = z.infer<typeof ApiKeyCreateSchema>;

// User Connection types
export const UserConnectionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  provider_id: z.string(),
  external_user_id: z.string(),
  status: z.enum(['pending', 'active', 'inactive', 'error']),
  metadata: z.record(z.string(), z.any()),
  created_at: z.string(),
  updated_at: z.string(),
  last_synced_at: z.string().optional(),
  provider: z.string().optional(),
});

export type UserConnection = z.infer<typeof UserConnectionSchema>;

// Developer types
export const DeveloperSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  api_key: z.string(),
  name: z.string(),
  email: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

export type Developer = z.infer<typeof DeveloperSchema>;

// Invitation types
export const InvitationSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string(),
  status: z.enum(['pending', 'accepted', 'expired', 'failed', 'sent']),
  expires_at: z.string(),
  created_at: z.string(),
});

export type Invitation = z.infer<typeof InvitationSchema>;

export const InvitationCreateSchema = z.object({
  email: z.string().email(),
  role: z.string(),
});

export type InvitationCreate = z.infer<typeof InvitationCreateSchema>;

export const InvitationAcceptSchema = z.object({
  token: z.string(),
  password: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

export type InvitationAccept = z.infer<typeof InvitationAcceptSchema>;

// Automation types
export const AutomationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  trigger: z.record(z.string(), z.any()),
  actions: z.array(z.record(z.string(), z.any())),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Automation = z.infer<typeof AutomationSchema>;

export const AutomationCreateSchema = z.object({
  name: z.string(),
  description: z.string(),
  trigger: z.record(z.string(), z.any()),
  actions: z.array(z.record(z.string(), z.any())),
});

export type AutomationCreate = z.infer<typeof AutomationCreateSchema>;

export const AutomationUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  trigger: z.record(z.string(), z.any()).optional(),
  actions: z.array(z.record(z.string(), z.any())).optional(),
  is_active: z.boolean().optional(),
});

export type AutomationUpdate = z.infer<typeof AutomationUpdateSchema>;

export const AutomationTriggerSchema = z.object({
  type: z.string(),
  config: z.record(z.string(), z.any()),
});

export type AutomationTrigger = z.infer<typeof AutomationTriggerSchema>;

export const TestAutomationResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.record(z.string(), z.any()).optional(),
});

export type TestAutomationResult = z.infer<typeof TestAutomationResultSchema>;

// Health data types
export const TimeSeriesParamsSchema = z.object({
  start_date: z.string(),
  end_date: z.string(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  granularity: z.enum(['hour', 'day', 'week', 'month']).optional(),
  metrics: z.array(z.string()).optional(),
  types: z.array(z.string()).optional(),
  limit: z.number().optional(),
});

export type TimeSeriesParams = z.infer<typeof TimeSeriesParamsSchema>;

export const TimeSeriesSampleSchema = z.object({
  timestamp: z.string(),
  value: z.number(),
  type: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type TimeSeriesSample = z.infer<typeof TimeSeriesSampleSchema>;

export const HealthDataParamsSchema = z.object({
  user_id: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  data_types: z.array(z.string()).optional(),
});

export type HealthDataParams = z.infer<typeof HealthDataParamsSchema>;

export const PaginatedResponseSchema = z.object({
  data: z.array(z.record(z.string(), z.any())),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    hasMore: z.boolean(),
  }),
});

export type PaginatedResponse = z.infer<typeof PaginatedResponseSchema>;

export const EventRecordResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  event_type: z.string(),
  data: z.record(z.string(), z.any()),
  timestamp: z.string(),
  start_time: z.string().optional(),
  start_datetime: z.string().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
});

export type EventRecordResponse = z.infer<typeof EventRecordResponseSchema>;

// Dashboard data types
export const ApiCallsDataPointSchema = z.object({
  timestamp: z.string(),
  count: z.number(),
  provider: z.string(),
});

export type ApiCallsDataPoint = z.infer<typeof ApiCallsDataPointSchema>;

export const DataPointsDataPointSchema = z.object({
  timestamp: z.string(),
  count: z.number(),
  data_type: z.string(),
});

export type DataPointsDataPoint = z.infer<typeof DataPointsDataPointSchema>;

export const AutomationTriggersDataPointSchema = z.object({
  timestamp: z.string(),
  count: z.number(),
  automation_id: z.string(),
});

export type AutomationTriggersDataPoint = z.infer<typeof AutomationTriggersDataPointSchema>;

export const TriggersByTypeDataPointSchema = z.object({
  type: z.string(),
  count: z.number(),
  percentage: z.number(),
});

export type TriggersByTypeDataPoint = z.infer<typeof TriggersByTypeDataPointSchema>;

// Error response types
export const ApiErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.string(), z.any()).optional(),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

// Additional wellness types
export const MoodEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  mood: z.number().min(1).max(10),
  energy: z.number().min(1).max(10),
  stress: z.number().min(1).max(10),
  notes: z.string().optional(),
  timestamp: z.date(),
});

export type MoodEntry = z.infer<typeof MoodEntrySchema>;

export const GratitudeEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  entry: z.string(),
  timestamp: z.date(),
});

export type GratitudeEntry = z.infer<typeof GratitudeEntrySchema>;

export const FoodTriggerSchema = z.object({
  id: z.string(),
  userId: z.string(),
  food: z.string(),
  symptom: z.string(),
  severity: z.number().min(1).max(10),
  notes: z.string().optional(),
  timestamp: z.date(),
});

export type FoodTrigger = z.infer<typeof FoodTriggerSchema>;

export const ProgressPhotoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  category: z.string(),
  url: z.string(),
  notes: z.string().optional(),
  timestamp: z.date(),
});

export type ProgressPhoto = z.infer<typeof ProgressPhotoSchema>;

export const HypnosisSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(),
  duration: z.number(),
  effectiveness: z.number().min(1).max(10),
  notes: z.string().optional(),
  timestamp: z.date(),
});

export type HypnosisSession = z.infer<typeof HypnosisSessionSchema>;

// Sleep and Activity data types (for health integration)

// Data source (provider info)
export const DataSourceSchema = z.object({
  provider_name: z.string(),
  device_id: z.string().optional(),
});

export type DataSource = z.infer<typeof DataSourceSchema>;

// Sleep stages breakdown
export const SleepStagesSchema = z.object({
  awake_minutes: z.number().optional(),
  light_minutes: z.number().optional(),
  deep_minutes: z.number().optional(),
  rem_minutes: z.number().optional(),
});

export type SleepStages = z.infer<typeof SleepStagesSchema>;

// Sleep Summary (from backend /users/{id}/summaries/sleep)
export const SleepSummarySchema = z.object({
  date: z.string(),
  source: DataSourceSchema.optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  duration_minutes: z.number().optional(),
  time_in_bed_minutes: z.number().optional(),
  efficiency_percent: z.number().optional(),
  stages: SleepStagesSchema.optional(),
  interruptions_count: z.number().optional(),
  avg_heart_rate_bpm: z.number().optional(),
  avg_hrv_rmssd_ms: z.number().optional(),
  avg_respiratory_rate: z.number().optional(),
  avg_spo2_percent: z.number().optional(),
});

export type SleepSummary = z.infer<typeof SleepSummarySchema>;

// Workout (from backend /users/{id}/events/workouts)
export const WorkoutSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string().optional(),
  start_time: z.string(),
  end_time: z.string(),
  duration_seconds: z.number().optional(),
  source: DataSourceSchema.optional(),
  calories_kcal: z.number().optional(),
  distance_meters: z.number().optional(),
  avg_heart_rate_bpm: z.number().optional(),
  max_heart_rate_bpm: z.number().optional(),
  avg_pace_sec_per_km: z.number().optional(),
  elevation_gain_meters: z.number().optional(),
});

export type Workout = z.infer<typeof WorkoutSchema>;

// Activity Summary
export const ActivitySummarySchema = z.object({
  date: z.string(),
  source: DataSourceSchema.optional(),
  steps: z.number().optional(),
  distance_meters: z.number().optional(),
  floors_climbed: z.number().optional(),
  active_calories_kcal: z.number().optional(),
  total_calories_kcal: z.number().optional(),
  active_duration_seconds: z.number().optional(),
});

export type ActivitySummary = z.infer<typeof ActivitySummarySchema>;