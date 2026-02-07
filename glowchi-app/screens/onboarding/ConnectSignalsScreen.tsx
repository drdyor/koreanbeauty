import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Colors } from '../../constants';

export default function ConnectSignalsScreen() {
  const { updateStep, updatePreferences, completeOnboarding } = useOnboarding();
  const [connectHealthData, setConnectHealthData] = useState(false);

  const handleConnect = () => {
    setConnectHealthData(true);
    updatePreferences({ connectHealthData: true });
    // In a real app, this would trigger the health data permission flow
    // For now, we'll just mark it as connected
  };

  const handleSkip = () => {
    updatePreferences({ connectHealthData: false });
    completeOnboarding();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF5F7', '#FFE8EB', '#FFF5F7']}
        style={styles.background}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.header}>Let's connect your wellness signals</Text>

            <Text style={styles.subheader}>
              Help me understand your patterns by connecting gentle health signals. This lets me respond to your rest, movement, and heart rhythms.
            </Text>

            {/* Health Connect Visual */}
            <View style={styles.connectContainer}>
              <View style={styles.healthIcon}>
                <Text style={styles.healthEmoji}>❤️</Text>
              </View>
              <View style={styles.connectLine} />
              <View style={styles.catIcon}>
                <Text style={styles.catEmoji}>🐱</Text>
              </View>
            </View>

            <Text style={styles.connectText}>
              Read-only access, you control what connects, your patterns stay private.
            </Text>

            {/* Cat Message Bubble */}
            <View style={styles.messageBubble}>
              <Text style={styles.catMessage}>
                "I love learning about your natural rhythms - it helps me support your glow!"
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.connectButton, connectHealthData && styles.connectButtonConnected]}
                onPress={handleConnect}
                disabled={connectHealthData}
              >
                <Text style={[
                  styles.connectButtonText,
                  connectHealthData && styles.connectButtonTextConnected
                ]}>
                  {connectHealthData ? 'Connected! ✨' : 'Connect signals'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip for gentle manual tracking</Text>
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
    marginBottom: 40,
    lineHeight: 22,
  },
  connectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  healthIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  healthEmoji: {
    fontSize: 30,
  },
  connectLine: {
    width: 60,
    height: 2,
    backgroundColor: Colors.primary.pink,
    marginHorizontal: 20,
  },
  catIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  catEmoji: {
    fontSize: 30,
  },
  connectText: {
    fontSize: 14,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
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
    gap: 16,
  },
  connectButton: {
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
  connectButtonConnected: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  connectButtonTextConnected: {
    color: '#FFFFFF',
  },
  skipButton: {
    backgroundColor: 'transparent',
    alignSelf: 'center',
  },
  skipButtonText: {
    color: Colors.neutral[600],
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
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