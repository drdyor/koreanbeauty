// Android Health Connect Integration
import { Platform } from 'react-native';
import {
  initialize,
  requestPermission,
  readRecords,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';

export interface HealthConnectData {
  steps: number;
  sleepHours: number;
  hrv?: number;
  restingHR?: number;
  activeMinutes?: number;
}

class HealthConnectService {
  private initialized = false;

  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.log('[HealthConnect] Not available on this platform');
      return false;
    }

    try {
      const isInitialized = await initialize();

      if (isInitialized) {
        console.log('[HealthConnect] Initialized successfully');
        this.initialized = true;
        return true;
      } else {
        console.log('[HealthConnect] SDK not available');
        return false;
      }
    } catch (error) {
      console.error('[HealthConnect] Initialization failed:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const permissions = [
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'SleepSession' },
        { accessType: 'read', recordType: 'HeartRateVariabilityRmssd' },
        { accessType: 'read', recordType: 'HeartRate' },
        { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
      ] as const;

      const grantedPermissions = await requestPermission(permissions as any);
      console.log('[HealthConnect] Permissions granted:', grantedPermissions.length > 0);
      return grantedPermissions.length > 0;
    } catch (error) {
      console.error('[HealthConnect] Permission request failed:', error);
      return false;
    }
  }

  async getTodaySteps(): Promise<number> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: today.toISOString(),
          endTime: new Date().toISOString(),
        },
      });

      const totalSteps = result.records.reduce((sum: number, record: any) => {
        return sum + (record.count || 0);
      }, 0);

      console.log('[HealthConnect] Steps today:', totalSteps);
      return totalSteps;
    } catch (error) {
      console.error('[HealthConnect] Error getting steps:', error);
      return 0;
    }
  }

  async getLastNightSleep(): Promise<number> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(18, 0, 0, 0);

      const endDate = new Date(now);
      endDate.setHours(12, 0, 0, 0);

      const result = await readRecords('SleepSession', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
        },
      });

      const totalMinutes = result.records.reduce((sum: number, record: any) => {
        const start = new Date(record.startTime).getTime();
        const end = new Date(record.endTime).getTime();
        const minutes = (end - start) / (1000 * 60);
        return sum + minutes;
      }, 0);

      const hours = totalMinutes / 60;
      console.log('[HealthConnect] Sleep hours:', hours.toFixed(1));
      return Math.round(hours * 10) / 10;
    } catch (error) {
      console.error('[HealthConnect] Error getting sleep:', error);
      return 7; // Default to 7 hours
    }
  }

  async getLatestHRV(): Promise<number | undefined> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const result = await readRecords('HeartRateVariabilityRmssd', {
        timeRangeFilter: {
          operator: 'between',
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date().toISOString(),
        },
      });

      if (result.records.length === 0) {
        return undefined;
      }

      const latestHRV = result.records[result.records.length - 1].heartRateVariabilityMillis;
      console.log('[HealthConnect] Latest HRV:', latestHRV);
      return latestHRV;
    } catch (error) {
      console.log('[HealthConnect] No HRV data');
      return undefined;
    }
  }

  async getRestingHeartRate(): Promise<number | undefined> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const result = await readRecords('HeartRate', {
        timeRangeFilter: {
          operator: 'between',
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date().toISOString(),
        },
      });

      if (result.records.length === 0) {
        return undefined;
      }

      const avgHR = result.records.reduce((sum: number, record: any) => {
        return sum + (record.beatsPerMinute || 0);
      }, 0) / result.records.length;

      console.log('[HealthConnect] Avg resting HR:', avgHR);
      return Math.round(avgHR);
    } catch (error) {
      console.log('[HealthConnect] No heart rate data');
      return undefined;
    }
  }

  async getActiveMinutes(): Promise<number> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await readRecords('ActiveCaloriesBurned', {
        timeRangeFilter: {
          operator: 'between',
          startTime: today.toISOString(),
          endTime: new Date().toISOString(),
        },
      });

      const totalCalories = result.records.reduce((sum: number, record: any) => {
        return sum + (record.energy?.inKilocalories || 0);
      }, 0);

      // Rough estimate: 1 kcal burned ≈ 0.2 minutes of activity
      const activeMinutes = Math.round(totalCalories / 5);
      console.log('[HealthConnect] Active minutes:', activeMinutes);
      return activeMinutes;
    } catch (error) {
      console.error('[HealthConnect] Error getting active calories:', error);
      return 0;
    }
  }

  async getAllTodayData(): Promise<HealthConnectData> {
    const [steps, sleepHours, hrv, restingHR, activeMinutes] = await Promise.all([
      this.getTodaySteps(),
      this.getLastNightSleep(),
      this.getLatestHRV(),
      this.getRestingHeartRate(),
      this.getActiveMinutes(),
    ]);

    return {
      steps,
      sleepHours,
      hrv,
      restingHR,
      activeMinutes,
    };
  }
}

export const healthConnectService = new HealthConnectService();
