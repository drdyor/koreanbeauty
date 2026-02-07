import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  UserConnection,
  EventRecordResponse,
  TimeSeriesParams,
  TimeSeriesSample,
  SleepSummary,
  Workout,
} from '../types';

// Generic paginated response for this service
interface PaginatedResult<T> {
  data: T[];
  pagination?: {
    next_cursor?: string;
    previous_cursor?: string;
    has_more?: boolean;
    total_count?: number;
  };
}

export interface WorkoutsParams {
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
  sort_order?: 'asc' | 'desc';
  workout_type?: string;
  source_name?: string;
  min_duration?: number;
  max_duration?: number;
  sort_by?:
    | 'start_datetime'
    | 'end_datetime'
    | 'duration_seconds'
    | 'type'
    | 'source_name';
  [key: string]: string | number | undefined;
}

export const healthService = {
  /**
   * Synchronize workouts/exercises/activities from fitness provider API for a specific user
   */
  async synchronizeProvider(provider: string, userId: string): Promise<void> {
    return apiClient.post<void>(
      API_ENDPOINTS.providerSynchronization(provider, userId)
    );
  },

  /**
   * Get user connections for a user
   */
  async getUserConnections(userId: string): Promise<UserConnection[]> {
    return apiClient.get<UserConnection[]>(
      API_ENDPOINTS.userConnections(userId)
    );
  },

  /**
   * Get workouts for a user
   */
  async getWorkouts(
    userId: string,
    params?: WorkoutsParams
  ): Promise<PaginatedResult<Workout>> {
    return apiClient.get<PaginatedResult<Workout>>(
      `/api/v1/users/${userId}/events/workouts`,
      { params }
    );
  },

  /**
   * Get sleep summaries (daily aggregated sleep data)
   */
  async getSleepSummaries(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<PaginatedResult<SleepSummary>> {
    return apiClient.get<PaginatedResult<SleepSummary>>(
      `/api/v1/users/${userId}/summaries/sleep`,
      {
        params: { start_date: startDate, end_date: endDate },
      }
    );
  },

  /**
   * Get sleep sessions (individual sleep events)
   */
  async getSleepSessions(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<PaginatedResult<SleepSummary>> {
    return apiClient.get<PaginatedResult<SleepSummary>>(
      `/api/v1/users/${userId}/events/sleep`,
      {
        params: { start_date: startDate, end_date: endDate },
      }
    );
  },

  /**
   * Get time series data (heart rate, steps, HRV, etc.)
   */
  async getTimeSeries(
    userId: string,
    params: TimeSeriesParams
  ): Promise<PaginatedResult<TimeSeriesSample>> {
    return apiClient.get<PaginatedResult<TimeSeriesSample>>(
      `/api/v1/users/${userId}/timeseries`,
      { params }
    );
  },

  /**
   * Trigger data sync from a provider
   */
  async syncProviderData(
    provider: string,
    userId: string
  ): Promise<void> {
    return apiClient.post<void>(
      `/api/v1/providers/${provider}/users/${userId}/sync`
    );
  },
};
