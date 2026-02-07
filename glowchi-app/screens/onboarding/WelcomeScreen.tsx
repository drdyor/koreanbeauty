import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Colors } from '../../constants';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { updateStep } = useOnboarding();

  const handleNext = () => {
    updateStep(1);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF5F7', '#FFE8EB', '#FFF5F7']}
        style={styles.background}
      >
        {/* Animated Cat Mascot Placeholder */}
        <View style={styles.catContainer}>
          <View style={styles.catBody}>
            <View style={styles.catHead}>
              <View style={styles.catEars}>
                <View style={styles.ear} />
                <View style={styles.ear} />
              </View>
              <View style={styles.catFace}>
                <View style={styles.catEyes}>
                  <View style={styles.eye} />
                  <View style={styles.eye} />
                </View>
                <View style={styles.catNose} />
                <View style={styles.catMouth} />
              </View>
            </View>
            <View style={styles.catGlow}>
              <View style={styles.glowEffect} />
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.header}>Meet your wellness companion ✨</Text>

          <View style={styles.bodyContainer}>
            <Text style={styles.bodyText}>
              🐱 I'm here to help you notice what makes you feel good and glow brighter each day
            </Text>
            <Text style={styles.bodyText}>
              🌟 Together we'll track simple daily moments that support your radiance
            </Text>
            <Text style={styles.bodyText}>
              💝 Your patterns are safe with me - I'm just here to care
            </Text>
          </View>

          {/* Cat Message Bubble */}
          <View style={styles.messageBubble}>
            <Text style={styles.catMessage}>
              "Hi! I'm so happy you're here. Let's start our wellness journey together!"
            </Text>
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Let's begin our journey</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, styles.activeDot]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
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
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  catContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  catBody: {
    position: 'relative',
  },
  catHead: {
    width: 120,
    height: 100,
    backgroundColor: '#FFB6C1',
    borderRadius: 60,
    position: 'relative',
  },
  catEars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: -15,
    left: 20,
    right: 20,
  },
  ear: {
    width: 25,
    height: 30,
    backgroundColor: '#FFB6C1',
    borderRadius: 12,
  },
  catFace: {
    alignItems: 'center',
    marginTop: 25,
  },
  catEyes: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  eye: {
    width: 12,
    height: 16,
    backgroundColor: '#2D3748',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  catNose: {
    width: 8,
    height: 6,
    backgroundColor: '#E53E3E',
    borderRadius: 3,
    marginBottom: 8,
  },
  catMouth: {
    width: 20,
    height: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#2D3748',
    borderRadius: 10,
  },
  catGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
  },
  glowEffect: {
    flex: 1,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 182, 193, 0.3)',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.neutral[800],
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 34,
  },
  bodyContainer: {
    marginBottom: 32,
  },
  bodyText: {
    fontSize: 18,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
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
    maxWidth: width * 0.8,
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
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 40,
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