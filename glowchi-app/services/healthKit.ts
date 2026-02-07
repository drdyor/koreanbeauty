// iOS HealthKit Integration
import { Platform } from 'react-native';
import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
} from 'react-native-health';

const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.HeartRateVariability,
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
    ],
    write: [], // We don't write to HealthKit
  },
};

export interface HealthKitData {
  steps: number;
  sleepHours: number;
  hrv?: number;
  restingHR?: number;
  activeMinutes?: number;
}

class HealthKitService {
  private initialized = false;

  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.log('[HealthKit] Not available on this platform');
      return false;
    }

    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(permissions, (error) => {
        if (error) {
          console.error('[HealthKit] Initialization failed:', error);
          resolve(false);
        } else {
          console.log('[HealthKit] Initialized successfully');
          this.initialized = true;
          resolve(true);
        }
      });
    });
  }

  async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    return new Promise((resolve) => {
      AppleHealthKit.isAvailable((err, available) => {
        resolve(!err && available);
      });
    });
  }

  async getTodaySteps(): Promise<number> {
    if (!this.initialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      const options = {
        startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        endDate: new Date().toISOString(),
      };

      AppleHealthKit.getStepCount(options, (err, results) => {
        if (err) {
          console.error('[HealthKit] Error getting steps:', err);
          resolve(0);
          return;
        }

        const steps = results?.value || 0;
        console.log('[HealthKit] Steps today:', steps);
        resolve(steps);
      });
    });
  }

  async getLastNightSleep(): Promise<number> {
    if (!this.initialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      // Get sleep from yesterday 6 PM to today 12 PM (covers most sleep patterns)
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(18, 0, 0, 0);

      const endDate = new Date(now);
      endDate.setHours(12, 0, 0, 0);

      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 50, // Limit to prevent loading thousands of samples
      };

      AppleHealthKit.getSleepSamples(options, (err, results) => {
        if (err) {
          console.error('[HealthKit] Error getting sleep:', err);
          resolve(7); // Default to 7 hours if error
          return;
        }

        if (!results || results.length === 0) {
          console.log('[HealthKit] No sleep data found');
          resolve(7);
          return;
        }

        // Sum up all sleep periods (both "asleep" and "in bed")
        // Note: TypeScript types are incorrect - value is actually a string
        const totalMinutes = results.reduce((sum, sample) => {
          const sleepValue = (sample as any).value as string;
          if (sleepValue === 'ASLEEP' || sleepValue === 'INBED') {
            const start = new Date(sample.startDate).getTime();
            const end = new Date(sample.endDate).getTime();
            const minutes = (end - start) / (1000 * 60);
            return sum + minutes;
          }
          return sum;
        }, 0);

        const hours = totalMinutes / 60;
        console.log('[HealthKit] Sleep hours:', hours.toFixed(1));
        resolve(Math.round(hours * 10) / 10); // Round to 1 decimal
      });
    });
  }

  async getLatestHRV(): Promise<number | undefined> {
    if (!this.initialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      const options = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
        endDate: new Date().toISOString(),
        limit: 1,
      };

      AppleHealthKit.getHeartRateVariabilitySamples(options, (err, results) => {
        if (err || !results || results.length === 0) {
          console.log('[HealthKit] No HRV data');
          resolve(undefined);
          return;
        }

        const hrv = results[0].value;
        console.log('[HealthKit] Latest HRV:', hrv);
        resolve(hrv);
      });
    });
  }

  async getRestingHeartRate(): Promise<number | undefined> {
    if (!this.initialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      const options = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        limit: 10,
      };

      AppleHealthKit.getHeartRateSamples(options, (err, results) => {
        if (err || !results || results.length === 0) {
          console.log('[HealthKit] No heart rate data');
          resolve(undefined);
          return;
        }

        // Average the heart rate samples
        const avgHR = results.reduce((sum, sample) => sum + sample.value, 0) / results.length;
        console.log('[HealthKit] Avg resting HR:', avgHR);
        resolve(Math.round(avgHR));
      });
    });
  }

  async getActiveMinutes(): Promise<number> {
    if (!this.initialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      const options = {
        startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        endDate: new Date().toISOString(),
      };

      AppleHealthKit.getActiveEnergyBurned(options, (err, results) => {
        if (err || !results || results.length === 0) {
          resolve(0);
          return;
        }

        // Sum all active energy burned samples
        const totalKcal = results.reduce((sum, sample) => sum + sample.value, 0);
        // Rough estimate: 1 kcal burned ≈ 0.2 minutes of activity
        const activeMinutes = Math.round(totalKcal / 5); // More conservative estimate
        console.log('[HealthKit] Active minutes:', activeMinutes);
        resolve(activeMinutes);
      });
    });
  }

  async getAllTodayData(): Promise<HealthKitData> {
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

export const healthKitService = new HealthKitService();
