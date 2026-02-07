// Provider constants for external integrations
export const PROVIDERS = {
  GARMIN: 'garmin',
  POLAR: 'polar',
  SUUNTO: 'suunto',
  FITBIT: 'fitbit',
  STRAVA: 'strava',
  APPLE_HEALTH: 'apple_health',
  GOOGLE_FIT: 'google_fit',
} as const;

export type ProviderType = typeof PROVIDERS[keyof typeof PROVIDERS];

export const PROVIDER_DISPLAY_NAMES = {
  [PROVIDERS.GARMIN]: 'Garmin',
  [PROVIDERS.POLAR]: 'Polar',
  [PROVIDERS.SUUNTO]: 'Suunto',
  [PROVIDERS.FITBIT]: 'Fitbit',
  [PROVIDERS.STRAVA]: 'Strava',
  [PROVIDERS.APPLE_HEALTH]: 'Apple Health',
  [PROVIDERS.GOOGLE_FIT]: 'Google Fit',
} as const;