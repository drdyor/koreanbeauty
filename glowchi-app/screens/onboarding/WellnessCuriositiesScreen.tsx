import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Colors } from '../../constants';

const curiosityOptions = [
  {
    id: 'medication',
    title: 'Starting new wellness support',
    subtitle: 'Tracking baselines & gentle changes',
    emoji: '💊',
  },
  {
    id: 'chronic',
    title: 'Managing ongoing patterns',
    subtitle: 'Supporting wellness consistency',
    emoji: '🌱',
  },
  {
    id: 'changes',
    title: 'Tracking gentle changes',
    subtitle: 'Noticing wellness shifts',
    emoji: '📈',
  },
  {
    id: 'conversations',
    title: 'Preparing for wellness conversations',
    subtitle: 'Getting ready for appointments',
    emoji: '💬',
  },
  {
    id: 'hormonal',
    title: 'Cycle rhythm awareness',
    subtitle: 'Understanding hormonal patterns',
    emoji: '🌙',
  },
  {
    id: 'transitions',
    title: 'Transition support',
    subtitle: 'Navigating life changes',
    emoji: '🦋',
  },
  {
    id: 'pms',
    title: 'PMS pattern noticing',
    subtitle: 'Understanding monthly rhythms',
    emoji: '🌸',
  },
  {
    id: 'fertility',
    title: 'Fertility wellness',
    subtitle: 'Supporting reproductive health',
    emoji: '🌷',
  },
  {
    id: 'focus',
    title: 'Focus flow support',
    subtitle: 'Supporting mental clarity',
    emoji: '🎯',
  },
  {
    id: 'energy',
    title: 'Energy pattern awareness',
    subtitle: 'Understanding energy rhythms',
    emoji: '⚡',
  },
  {
    id: 'mood',
    title: 'Mood journey noticing',
    subtitle: 'Supporting emotional wellness',
    emoji: '😊',
  },
  {
    id: 'overwhelm',
    title: 'Gentle overwhelm support',
    subtitle: "Managing life's intensity",
    emoji: '🌊',
  },
];

export default function WellnessCuriositiesScreen() {
  const { updateStep, updatePreferences, onboardingState } = useOnboarding();
  const [selectedCuriosities, setSelectedCuriosities] = useState<string[]>(
    onboardingState.userPreferences.wellnessContexts
  );
  const [customCuriosity, setCustomCuriosity] = useState('');

  const toggleCuriosity = (id: string) => {
    setSelectedCuriosities(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const handleNext = () => {
    const finalContexts = [...selectedCuriosities];
    if (customCuriosity.trim()) {
      finalContexts.push(customCuriosity.trim());
    }
    updatePreferences({ wellnessContexts: finalContexts });
    updateStep(5);
  };

  const handleSkip = () => {
    updateStep(5);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF5F7', '#FFE8EB', '#FFF5F7']}
        style={styles.background}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.header}>
              Tell me about your wellness curiosities
            </Text>
            <Text style={styles.subheader}>
              This helps me offer more personalized glow support. Skip anytime.
            </Text>

            <View style={styles.optionsContainer}>
              {curiosityOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionItem,
                    selectedCuriosities.includes(option.id) && styles.optionSelected
                  ]}
                  onPress={() => toggleCuriosity(option.id)}
                >
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <View style={styles.optionText}>
                    <Text style={[
                      styles.optionTitle,
                      selectedCuriosities.includes(option.id) && styles.optionTitleSelected
                    ]}>
                      {option.title}
                    </Text>
                    <Text style={[
                      styles.optionSubtitle,
                      selectedCuriosities.includes(option.id) && styles.optionSubtitleSelected
                    ]}>
                      {option.subtitle}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Input */}
            <View style={styles.customContainer}>
              <Text style={styles.customLabel}>Any other wellness areas you're curious about?</Text>
              <TextInput
                style={styles.customInput}
                placeholder="Share your wellness curiosity..."
                value={customCuriosity}
                onChangeText={setCustomCuriosity}
                multiline
                maxLength={100}
              />
            </View>

            {/* Cat Message Bubble */}
            <View style={styles.messageBubble}>
              <Text style={styles.catMessage}>
                "It's okay to be curious about different aspects of wellness. I'm here to explore gently with you."
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.activeDot]} />
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
    marginBottom: 32,
    lineHeight: 22,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
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
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: Colors.primary.pink,
  },
  optionSubtitle: {
    fontSize: 14,
    color: Colors.neutral[600],
  },
  optionSubtitleSelected: {
    color: Colors.primary.pink,
  },
  customContainer: {
    marginBottom: 32,
  },
  customLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: 12,
  },
  customInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.neutral[700],
    minHeight: 60,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  skipButtonText: {
    color: Colors.neutral[600],
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  nextButton: {
    flex: 1,
    backgroundColor: Colors.primary.pink,
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: Colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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