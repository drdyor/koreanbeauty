import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingState {
  currentStep: number;
  isComplete: boolean;
  userPreferences: {
    pace: 'gentle' | 'balanced' | 'attentive' | null;
    wellnessContexts: string[];
    trackingCategories: string[];
    connectHealthData: boolean;
    notificationsEnabled: boolean;
  };
}

interface OnboardingContextType {
  onboardingState: OnboardingState;
  updateStep: (step: number) => void;
  updatePreferences: (preferences: Partial<OnboardingState['userPreferences']>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const defaultState: OnboardingState = {
  currentStep: 0,
  isComplete: false,
  userPreferences: {
    pace: null,
    wellnessContexts: [],
    trackingCategories: [
      'mood',
      'cat-glow',
      'sleep',
      'movement',
      'hydration',
      'nourishment',
      'screen-time',
      'notes'
    ],
    connectHealthData: false,
    notificationsEnabled: false,
  },
};

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(defaultState);

  const updateStep = (step: number) => {
    setOnboardingState(prev => ({ ...prev, currentStep: step }));
  };

  const updatePreferences = (preferences: Partial<OnboardingState['userPreferences']>) => {
    setOnboardingState(prev => ({
      ...prev,
      userPreferences: { ...prev.userPreferences, ...preferences }
    }));
  };

  const completeOnboarding = async () => {
    const newState = { ...onboardingState, isComplete: true };
    setOnboardingState(newState);
    await AsyncStorage.setItem('onboardingComplete', 'true');
    await AsyncStorage.setItem('userPreferences', JSON.stringify(newState.userPreferences));
  };

  const resetOnboarding = async () => {
    setOnboardingState(defaultState);
    await AsyncStorage.removeItem('onboardingComplete');
    await AsyncStorage.removeItem('userPreferences');
  };

  return (
    <OnboardingContext.Provider value={{
      onboardingState,
      updateStep,
      updatePreferences,
      completeOnboarding,
      resetOnboarding,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};