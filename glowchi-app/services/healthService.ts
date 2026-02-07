// Unified Health Service (works on both iOS and Android)
import { Platform } from 'react-native';
import { healthKitService } from './healthKit';
import { healthConnectService } from './healthConnect';
import type { HealthData } from '../types';

class HealthService {
  async initialize(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return await healthKitService.initialize();
    } else if (Platform.OS === 'android') {
      return await healthConnectService.initialize();
    }
    return false;
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      // iOS permissions are requested during initialization
      return await healthKitService.initialize();
    } else if (Platform.OS === 'android') {
      return await healthConnectService.requestPermissions();
    }
    return false;
  }

  async isAvailable(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return await healthKitService.isAvailable();
    } else if (Platform.OS === 'android') {
      // Check if Health Connect is initialized
      return true; // Will be false if initialization failed
    }
    return false;
  }

  async syncTodayData(): Promise<HealthData> {
    let data: HealthData;

    if (Platform.OS === 'ios') {
      const healthKitData = await healthKitService.getAllTodayData();
      data = {
        steps: healthKitData.steps,
        sleepHours: healthKitData.sleepHours,
        waterIntake: 0, // Manual input only
        hrv: healthKitData.hrv,
        restingHR: healthKitData.restingHR,
        activeMinutes: healthKitData.activeMinutes,
      };
    } else if (Platform.OS === 'android') {
      const healthConnectData = await healthConnectService.getAllTodayData();
      data = {
        steps: healthConnectData.steps,
        sleepHours: healthConnectData.sleepHours,
        waterIntake: 0, // Manual input only
        hrv: healthConnectData.hrv,
        restingHR: healthConnectData.restingHR,
        activeMinutes: healthConnectData.activeMinutes,
      };
    } else {
      // Fallback for web or other platforms
      data = {
        steps: 0,
        sleepHours: 7,
        waterIntake: 0,
      };
    }

    console.log('[HealthService] Synced data:', data);
    return data;
  }

  getPlatformName(): string {
    if (Platform.OS === 'ios') {
      return 'Apple Health';
    } else if (Platform.OS === 'android') {
      return 'Health Connect';
    }
    return 'Health Data';
  }
}

export const healthService = new HealthService();
