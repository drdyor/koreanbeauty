import React from 'react';
import { View } from 'react-native';
import { useOnboarding } from '../contexts/OnboardingContext';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import PrivacyScreen from '../screens/onboarding/PrivacyScreen';
import DiscoveryScreen from '../screens/onboarding/DiscoveryScreen';
import WellnessRhythmScreen from '../screens/onboarding/WellnessRhythmScreen';
import WellnessCuriositiesScreen from '../screens/onboarding/WellnessCuriositiesScreen';
import DailyMomentsScreen from '../screens/onboarding/DailyMomentsScreen';
import ConnectSignalsScreen from '../screens/onboarding/ConnectSignalsScreen';

export default function OnboardingNavigator() {
  const { onboardingState } = useOnboarding();

  const renderCurrentScreen = () => {
    switch (onboardingState.currentStep) {
      case 0:
        return <WelcomeScreen />;
      case 1:
        return <PrivacyScreen />;
      case 2:
        return <DiscoveryScreen />;
      case 3:
        return <WellnessRhythmScreen />;
      case 4:
        return <WellnessCuriositiesScreen />;
      case 5:
        return <DailyMomentsScreen />;
      case 6:
        return <ConnectSignalsScreen />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderCurrentScreen()}
    </View>
  );
}