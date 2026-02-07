import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorBoundary from '../components/core/ErrorBoundary';
import { OnboardingProvider } from '../contexts/OnboardingContext';
import OnboardingNavigator from '../navigation/OnboardingNavigator';

function AppContent() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      // DEV: Skip onboarding for testing - remove this line in production
      const SKIP_ONBOARDING_FOR_DEV = true;
      if (SKIP_ONBOARDING_FOR_DEV) {
        setIsOnboardingComplete(true);
        setIsLoading(false);
        return;
      }

      const onboardingComplete = await AsyncStorage.getItem('onboardingComplete');
      setIsOnboardingComplete(onboardingComplete === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsOnboardingComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    // Show loading screen while checking onboarding status
    return (
      <ErrorBoundary>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FFF5F7' },
          }}
        >
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <StatusBar style="dark" />
      {isOnboardingComplete ? (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FFF5F7' },
          }}
        >
          <Stack.Screen name="(tabs)" />
        </Stack>
      ) : (
        <OnboardingProvider>
          <OnboardingNavigator />
        </OnboardingProvider>
      )}
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  return <AppContent />;
}
