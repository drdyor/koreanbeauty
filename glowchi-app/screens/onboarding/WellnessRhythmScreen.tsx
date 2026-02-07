import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Colors } from '../../constants';

const paceOptions = [
  {
    id: 'gentle',
    title: 'Gentle',
    description: 'Simple daily moments and basic glow patterns',
    emoji: '🌸',
  },
  {
    id: 'balanced',
    title: 'Balanced',
    description: 'Regular check-ins with some gentle details',
    emoji: '🌿',
  },
  {
    id: 'attentive',
    title: 'Attentive',
    description: 'Full wellness exploration and pattern noticing',
    emoji: '✨',
  },
];

const wellnessFocusOptions = [
  {
    id: 'general',
    title: 'Just general radiance and glow',
    emoji: '✨',
  },
  {
    id: 'medication',
    title: 'Starting/changing wellness support (medications, supplements)',
    emoji: '💊',
  },
  {
    id: 'hormonal',
    title: 'Hormonal wellness rhythm (cycles, transitions)',
    emoji: '🌙',
  },
  {
    id: 'mental',
    title: 'Mental wellness flow (mood, focus, energy)',
    emoji: '🧠',
  },
  {
    id: 'skin',
    title: 'Skin radiance journey',
    emoji: '💖',
  },
];

export default function WellnessRhythmScreen() {
  const { updateStep, updatePreferences, onboardingState } = useOnboarding();
  const [selectedPace, setSelectedPace] = useState<string | null>(onboardingState.userPreferences.pace);
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);

  const handleNext = () => {
    updatePreferences({
      pace: selectedPace as any,
      wellnessContexts: selectedFocus ? [selectedFocus] : [],
    });
    updateStep(4);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF5F7', '#FFE8EB', '#FFF5F7']}
        style={styles.background}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.header}>What's your wellness pace?</Text>
            <Text style={styles.subheader}>
              This helps me tailor our journey to feel just right for you.
            </Text>

            {/* Pace Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How much detail feels supportive right now?</Text>
              <View style={styles.paceContainer}>
                {paceOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.paceOption,
                      selectedPace === option.id && styles.paceOptionSelected
                    ]}
                    onPress={() => setSelectedPace(option.id)}
                  >
                    <Text style={styles.paceEmoji}>{option.emoji}</Text>
                    <Text style={[
                      styles.paceTitle,
                      selectedPace === option.id && styles.paceTitleSelected
                    ]}>
                      {option.title}
                    </Text>
                    <Text style={[
                      styles.paceDescription,
                      selectedPace === option.id && styles.paceDescriptionSelected
                    ]}>
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Wellness Focus Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Would you like to explore any specific wellness areas?
              </Text>
              <View style={styles.focusContainer}>
                {wellnessFocusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.focusOption,
                      selectedFocus === option.id && styles.focusOptionSelected
                    ]}
                    onPress={() => setSelectedFocus(selectedFocus === option.id ? null : option.id)}
                  >
                    <Text style={styles.focusEmoji}>{option.emoji}</Text>
                    <Text style={[
                      styles.focusLabel,
                      selectedFocus === option.id && styles.focusLabelSelected
                    ]}>
                      {option.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cat Message Bubble */}
            <View style={styles.messageBubble}>
              <Text style={styles.catMessage}>
                "Whatever pace feels right for you is perfect. I'm here to support your glow!"
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.nextButton, !selectedPace && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!selectedPace}
            >
              <Text style={[styles.nextButtonText, !selectedPace && styles.nextButtonTextDisabled]}>
                Let's personalize
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.activeDot]} />
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
    marginBottom: 8,
    lineHeight: 34,
  },
  subheader: {
    fontSize: 16,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: 20,
    lineHeight: 26,
  },
  paceContainer: {
    gap: 12,
  },
  paceOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  paceOptionSelected: {
    borderWidth: 2,
    borderColor: Colors.primary.pink,
    shadowOpacity: 0.1,
    elevation: 5,
  },
  paceEmoji: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  paceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[800],
    textAlign: 'center',
    marginBottom: 4,
  },
  paceTitleSelected: {
    color: Colors.primary.pink,
  },
  paceDescription: {
    fontSize: 14,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  paceDescriptionSelected: {
    color: Colors.primary.pink,
  },
  focusContainer: {
    gap: 8,
  },
  focusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  focusOptionSelected: {
    borderWidth: 2,
    borderColor: Colors.primary.pink,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  focusEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  focusLabel: {
    flex: 1,
    fontSize: 16,
    color: Colors.neutral[700],
    lineHeight: 22,
  },
  focusLabelSelected: {
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