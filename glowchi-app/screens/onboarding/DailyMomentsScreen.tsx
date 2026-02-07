import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Colors } from '../../constants';

const momentOptions = [
  { id: 'mood', label: 'How I\'m feeling today (mood/energy)', emoji: '🙂' },
  { id: 'cat-glow', label: 'My cat\'s current glow level', emoji: '🐾' },
  { id: 'sleep', label: 'Sleep rhythm last night', emoji: '💤' },
  { id: 'movement', label: 'Movement & fresh air', emoji: '🚶' },
  { id: 'hydration', label: 'Hydration & nourishment', emoji: '💧' },
  { id: 'nourishment', label: 'Food & body fuel', emoji: '🍎' },
  { id: 'wellness-support', label: 'Wellness support (if context selected)', emoji: '💊' },
  { id: 'screen-time', label: 'Screen time before rest', emoji: '📱' },
  { id: 'notes', label: 'Gentle notes & wins', emoji: '📝' },
];

export default function DailyMomentsScreen() {
  const { updateStep, updatePreferences, onboardingState } = useOnboarding();
  const [selectedMoments, setSelectedMoments] = useState<string[]>(
    onboardingState.userPreferences.trackingCategories
  );

  const toggleMoment = (id: string) => {
    setSelectedMoments(prev =>
      prev.includes(id)
        ? prev.filter(m => m !== id)
        : [...prev, id]
    );
  };

  const handleNext = () => {
    updatePreferences({ trackingCategories: selectedMoments });
    updateStep(6);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF5F7', '#FFE8EB', '#FFF5F7']}
        style={styles.background}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.header}>What moments shall we notice together?</Text>

            <Text style={styles.subheader}>
              Start with what feels meaningful. We can always add more glow moments later.
            </Text>

            <View style={styles.momentsContainer}>
              {momentOptions.map((moment) => (
                <TouchableOpacity
                  key={moment.id}
                  style={[
                    styles.momentItem,
                    selectedMoments.includes(moment.id) && styles.momentSelected
                  ]}
                  onPress={() => toggleMoment(moment.id)}
                >
                  <View style={styles.momentLeft}>
                    <Text style={styles.momentEmoji}>{moment.emoji}</Text>
                    <Text style={[
                      styles.momentLabel,
                      selectedMoments.includes(moment.id) && styles.momentLabelSelected
                    ]}>
                      {moment.label}
                    </Text>
                  </View>
                  <View style={[
                    styles.checkbox,
                    selectedMoments.includes(moment.id) && styles.checkboxChecked
                  ]}>
                    {selectedMoments.includes(moment.id) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Cat Message Bubble */}
            <View style={styles.messageBubble}>
              <Text style={styles.catMessage}>
                "Even small moments of noticing can help us glow brighter together!"
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.nextButton, selectedMoments.length === 0 && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={selectedMoments.length === 0}
            >
              <Text style={[styles.nextButtonText, selectedMoments.length === 0 && styles.nextButtonTextDisabled]}>
                Ready to start glowing
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
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
  momentsContainer: {
    marginBottom: 32,
  },
  momentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  momentSelected: {
    borderWidth: 2,
    borderColor: Colors.primary.pink,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  momentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  momentEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  momentLabel: {
    flex: 1,
    fontSize: 16,
    color: Colors.neutral[700],
    lineHeight: 22,
  },
  momentLabelSelected: {
    color: Colors.primary.pink,
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary.pink,
    borderColor: Colors.primary.pink,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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