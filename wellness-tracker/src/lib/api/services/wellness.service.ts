import { apiClient } from '../client';
import type {
  SymptomEntry,
  SymptomEntriesResponse,
  MedicationEntry,
  PatternAnalysisResponse,
  WellnessReport,
  HealthcareProvider,
  WellnessDashboardResponse,
  WellnessPreferences,
} from '../types';

export class WellnessService {
  /**
   * Symptom Tracking
   */
  async getSymptomEntries(
    userId: string,
    params?: {
      category?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<SymptomEntriesResponse> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.startDate) searchParams.set('start_date', params.startDate.toISOString());
    if (params?.endDate) searchParams.set('end_date', params.endDate.toISOString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const query = searchParams.toString();
    const endpoint = `/api/v1/users/${userId}/symptoms${query ? `?${query}` : ''}`;

    return apiClient.get<SymptomEntriesResponse>(endpoint);
  }

  async createSymptomEntry(userId: string, entry: Omit<SymptomEntry, 'id' | 'userId'>): Promise<SymptomEntry> {
    return apiClient.post<SymptomEntry>(`/api/v1/users/${userId}/symptoms`, entry);
  }

  async updateSymptomEntry(userId: string, entryId: string, updates: Partial<SymptomEntry>): Promise<SymptomEntry> {
    return apiClient.patch<SymptomEntry>(`/api/v1/users/${userId}/symptoms/${entryId}`, updates);
  }

  async deleteSymptomEntry(userId: string, entryId: string): Promise<void> {
    return apiClient.delete(`/api/v1/users/${userId}/symptoms/${entryId}`);
  }

  /**
   * Medication Tracking
   */
  async getMedications(userId: string): Promise<MedicationEntry[]> {
    return apiClient.get<MedicationEntry[]>(`/api/v1/users/${userId}/medications`);
  }

  async createMedication(userId: string, medication: Omit<MedicationEntry, 'id' | 'userId'>): Promise<MedicationEntry> {
    return apiClient.post<MedicationEntry>(`/api/v1/users/${userId}/medications`, medication);
  }

  async updateMedication(userId: string, medicationId: string, updates: Partial<MedicationEntry>): Promise<MedicationEntry> {
    return apiClient.patch<MedicationEntry>(`/api/v1/users/${userId}/medications/${medicationId}`, updates);
  }

  async logSideEffect(
    userId: string,
    medicationId: string,
    sideEffect: { symptom: string; severity: string; date: Date; notes?: string }
  ): Promise<MedicationEntry> {
    return apiClient.post<MedicationEntry>(`/api/v1/users/${userId}/medications/${medicationId}/side-effects`, sideEffect);
  }

  /**
   * Pattern Analysis
   */
  async getPatternAnalysis(
    userId: string,
    params?: {
      timeframe?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
      categories?: string[];
    }
  ): Promise<PatternAnalysisResponse> {
    const searchParams = new URLSearchParams();
    if (params?.timeframe) searchParams.set('timeframe', params.timeframe);
    if (params?.categories) params.categories.forEach(cat => searchParams.append('categories', cat));

    const query = searchParams.toString();
    const endpoint = `/api/v1/users/${userId}/patterns${query ? `?${query}` : ''}`;

    return apiClient.get<PatternAnalysisResponse>(endpoint);
  }

  /**
   * Healthcare Integration
   */
  async getHealthcareProviders(userId: string): Promise<HealthcareProvider[]> {
    return apiClient.get<HealthcareProvider[]>(`/api/v1/users/${userId}/providers`);
  }

  async addHealthcareProvider(
    userId: string,
    provider: Omit<HealthcareProvider, 'id' | 'userId' | 'lastShared'>
  ): Promise<HealthcareProvider> {
    return apiClient.post<HealthcareProvider>(`/api/v1/users/${userId}/providers`, provider);
  }

  async updateProviderSharing(
    userId: string,
    providerId: string,
    sharedCategories: string[]
  ): Promise<HealthcareProvider> {
    return apiClient.patch<HealthcareProvider>(
      `/api/v1/users/${userId}/providers/${providerId}/sharing`,
      { sharedData: sharedCategories }
    );
  }

  async generateWellnessReport(
    userId: string,
    params: {
      startDate: Date;
      endDate: Date;
      includePatterns?: boolean;
      includeMedications?: boolean;
    }
  ): Promise<WellnessReport> {
    return apiClient.post<WellnessReport>(`/api/v1/users/${userId}/reports`, params);
  }

  async shareReportWithProvider(
    userId: string,
    reportId: string,
    providerId: string
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`/api/v1/users/${userId}/reports/${reportId}/share/${providerId}`, {});
  }

  /**
   * Dashboard & Preferences
   */
  async getDashboardData(userId: string): Promise<WellnessDashboardResponse> {
    return apiClient.get<WellnessDashboardResponse>(`/api/v1/users/${userId}/dashboard`);
  }

  async getWellnessPreferences(userId: string): Promise<WellnessPreferences> {
    return apiClient.get<WellnessPreferences>(`/api/v1/users/${userId}/preferences`);
  }

  async updateWellnessPreferences(userId: string, preferences: Partial<WellnessPreferences>): Promise<WellnessPreferences> {
    return apiClient.patch<WellnessPreferences>(`/api/v1/users/${userId}/preferences`, preferences);
  }

  /**
   * Quick Actions
   */
  async quickCheckIn(
    userId: string,
    checkIn: {
      overallWellness: number;
      notes?: string;
      quickSymptoms?: Array<{ type: string; severity: number }>;
    }
  ): Promise<SymptomEntry[]> {
    return apiClient.post<SymptomEntry[]>(`/api/v1/users/${userId}/quick-checkin`, checkIn);
  }

  async getSymptomSuggestions(userId: string, query: string): Promise<string[]> {
    const response = await apiClient.get<{ suggestions: string[] }>(
      `/api/v1/users/${userId}/symptom-suggestions?q=${encodeURIComponent(query)}`
    );
    return response.suggestions;
  }
}

export const wellnessService = new WellnessService();