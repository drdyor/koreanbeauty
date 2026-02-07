import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { wellnessService } from '@/lib/api/services/wellness.service';
import type {
  SymptomEntry,
  MedicationEntry,
  WellnessReport,
  HealthcareProvider,
  WellnessPreferences,
} from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';

/**
 * Symptom Entries
 */
export function useSymptomEntries(
  userId: string,
  params?: {
    category?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
) {
  return useQuery({
    queryKey: queryKeys.wellness.symptoms(userId, params),
    queryFn: () => wellnessService.getSymptomEntries(userId, params),
    enabled: !!userId,
  });
}

export function useCreateSymptomEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, entry }: { userId: string; entry: Omit<SymptomEntry, 'id' | 'userId'> }) =>
      wellnessService.createSymptomEntry(userId, entry),
    onSuccess: (newEntry, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wellness.symptoms(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.wellness.dashboard(userId) });
      toast.success('Symptom entry saved');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to save symptom entry');
    },
  });
}

export function useUpdateSymptomEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      entryId,
      updates
    }: {
      userId: string;
      entryId: string;
      updates: Partial<SymptomEntry>
    }) =>
      wellnessService.updateSymptomEntry(userId, entryId, updates),
    onSuccess: (updatedEntry, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wellness.symptoms(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.wellness.dashboard(userId) });
      toast.success('Symptom entry updated');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update symptom entry');
    },
  });
}

/**
 * Medications
 */
export function useMedications(userId: string) {
  return useQuery({
    queryKey: queryKeys.wellness.medications(userId),
    queryFn: () => wellnessService.getMedications(userId),
    enabled: !!userId,
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, medication }: { userId: string; medication: Omit<MedicationEntry, 'id' | 'userId'> }) =>
      wellnessService.createMedication(userId, medication),
    onSuccess: (newMedication, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wellness.medications(userId) });
      toast.success('Medication added');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add medication');
    },
  });
}

export function useLogSideEffect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      medicationId,
      sideEffect
    }: {
      userId: string;
      medicationId: string;
      sideEffect: { symptom: string; severity: string; date: Date; notes?: string }
    }) =>
      wellnessService.logSideEffect(userId, medicationId, sideEffect),
    onSuccess: (updatedMedication, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wellness.medications(userId) });
      toast.success('Side effect logged');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to log side effect');
    },
  });
}

/**
 * Pattern Analysis
 */
export function usePatternAnalysis(
  userId: string,
  params?: {
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    categories?: string[];
  }
) {
  return useQuery({
    queryKey: queryKeys.wellness.patterns(userId, params),
    queryFn: () => wellnessService.getPatternAnalysis(userId, params),
    enabled: !!userId,
  });
}

/**
 * Dashboard
 */
export function useWellnessDashboard(userId: string) {
  return useQuery({
    queryKey: queryKeys.wellness.dashboard(userId),
    queryFn: () => wellnessService.getDashboardData(userId),
    enabled: !!userId,
  });
}

/**
 * Healthcare Providers
 */
export function useHealthcareProviders(userId: string) {
  return useQuery({
    queryKey: queryKeys.wellness.providers(userId),
    queryFn: () => wellnessService.getHealthcareProviders(userId),
    enabled: !!userId,
  });
}

export function useAddHealthcareProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, provider }: { userId: string; provider: Omit<HealthcareProvider, 'id' | 'userId' | 'lastShared'> }) =>
      wellnessService.addHealthcareProvider(userId, provider),
    onSuccess: (newProvider, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wellness.providers(userId) });
      toast.success('Healthcare provider added');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add healthcare provider');
    },
  });
}

/**
 * Wellness Reports
 */
export function useGenerateWellnessReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      params
    }: {
      userId: string;
      params: {
        startDate: Date;
        endDate: Date;
        includePatterns?: boolean;
        includeMedications?: boolean;
      }
    }) =>
      wellnessService.generateWellnessReport(userId, params),
    onSuccess: (report, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wellness.reports(userId) });
      toast.success('Wellness report generated');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to generate report');
    },
  });
}

export function useShareReportWithProvider() {
  return useMutation({
    mutationFn: ({
      userId,
      reportId,
      providerId
    }: {
      userId: string;
      reportId: string;
      providerId: string;
    }) =>
      wellnessService.shareReportWithProvider(userId, reportId, providerId),
    onSuccess: () => {
      toast.success('Report shared with healthcare provider');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to share report');
    },
  });
}

/**
 * Wellness Preferences
 */
export function useWellnessPreferences(userId: string) {
  return useQuery({
    queryKey: queryKeys.wellness.preferences(userId),
    queryFn: () => wellnessService.getWellnessPreferences(userId),
    enabled: !!userId,
  });
}

export function useUpdateWellnessPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, preferences }: { userId: string; preferences: Partial<WellnessPreferences> }) =>
      wellnessService.updateWellnessPreferences(userId, preferences),
    onSuccess: (updatedPrefs, { userId }) => {
      queryClient.setQueryData(queryKeys.wellness.preferences(userId), updatedPrefs);
      toast.success('Preferences updated');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update preferences');
    },
  });
}

/**
 * Quick Actions
 */
export function useQuickCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      checkIn
    }: {
      userId: string;
      checkIn: {
        overallWellness: number;
        notes?: string;
        quickSymptoms?: Array<{ type: string; severity: number }>;
      }
    }) =>
      wellnessService.quickCheckIn(userId, checkIn),
    onSuccess: (entries, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wellness.symptoms(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.wellness.dashboard(userId) });
      toast.success('Quick check-in completed');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to complete check-in');
    },
  });
}

export function useSymptomSuggestions(userId: string, query: string, enabled = false) {
  return useQuery({
    queryKey: ['wellness', 'suggestions', userId, query],
    queryFn: () => wellnessService.getSymptomSuggestions(userId, query),
    enabled: enabled && !!query && query.length > 2,
  });
}