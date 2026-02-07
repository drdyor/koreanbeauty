import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Colors } from '../../constants';

const discoveryOptions = [
  { id: 'friend', label: 'Friend shared our story', emoji: '🐱' },
  { id: 'instagram', label: 'Instagram wellness community', emoji: '📸' },
  { id: 'appstore', label: 'App Store discovery', emoji: '📱' },
  { id: 'youtube', label: 'YouTube wellness journey', emoji: '▶️' },
  { id: 'healthcare', label: 'Healthcare provider suggestion', emoji: '👩‍⚕️' },
  { id: 'search', label: 'Gentle wellness search', emoji: '🔍' },
  { id: 'forums', label: 'Wellness forums/discussions', emoji: '💬' },
  { id: 'facebook', label: 'Facebook wellness groups', emoji: '📘' },
  { id: 'synchronicity', label: 'Wellness synchronicity', emoji: '✨' },
];

export default function DiscoveryScreen() {
  const { updateStep } = useOnboarding();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleNext = () => {
    updateStep(3);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF5F7', '#FFE8EB', '#FFF5F7']}
        style={styles.background}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.header}>How did you find your glow companion?</Text>

            <View style={styles.optionsContainer}>
              {discoveryOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionItem,
                    selectedOption === option.id && styles.optionSelected
                  ]}
                  onPress={() => setSelectedOption(option.id)}
                >
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <Text style={[
                    styles.optionLabel,
                    selectedOption === option.id && styles.optionLabelSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Cat Message Bubble */}
            <View style={styles.messageBubble}>
              <Text style={styles.catMessage}>
                "I'm glad we're connected! Every wellness journey starts somewhere special."
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.nextButton, !selectedOption && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!selectedOption}
            >
              <Text style={[styles.nextButtonText, !selectedOption && styles.nextButtonTextDisabled]}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.activeDot]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  content: {
    flex: 1,
    paddingBottom: 120,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.neutral[800],
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 34,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: Colors.primary.pink,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: Colors.neutral[700],
    lineHeight: 22,
  },
  optionLabelSelected: {
    color: Colors.primary.pink,
    fontWeight: '600',
  },
  messageBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignSelf: 'center',
    maxWidth: 300,
  },
  catMessage: {
    fontSize: 16,
    color: Colors.neutral[700],
    textAlign: 'center',
    fontStyle: 'italic',
  },
  nextButton: {
    backgroundColor: Colors.primary.pink,
    borderRadius: 25,
    paddingHorizontal: 40,
    paddingVertical: 16,
    shadowColor: Colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    alignSelf: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: Colors.neutral[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  nextButtonTextDisabled: {
    color: Colors.neutral[500],
  },
  progressContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral[300],
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.primary.pink,
  },
});