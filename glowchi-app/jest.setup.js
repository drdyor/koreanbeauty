// jest.setup.js
// Matchers are now built into @testing-library/react-native v12.4+

// Mock Expo's import.meta.env to bypass winter runtime
global.__ExpoImportMetaRegistry = {
  set: jest.fn(),
  get: jest.fn(() => ({})),
};

// Mock structuredClone for Node < 17
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('mock-id')),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-health
jest.mock('react-native-health', () => ({
  default: {
    initHealthKit: jest.fn((permissions, callback) => callback(null)),
    isAvailable: jest.fn((callback) => callback(null, true)),
    getStepCount: jest.fn((options, callback) => callback(null, { value: 8000 })),
    getSleepSamples: jest.fn((options, callback) => callback(null, [])),
  },
  Constants: {
    Permissions: {
      Steps: 'Steps',
      SleepAnalysis: 'SleepAnalysis',
      HeartRateVariability: 'HeartRateVariability',
      HeartRate: 'HeartRate',
      ActiveEnergyBurned: 'ActiveEnergyBurned',
      DistanceWalkingRunning: 'DistanceWalkingRunning',
    },
  },
}));
