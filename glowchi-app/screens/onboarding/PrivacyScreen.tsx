import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Colors } from '../../constants';

export default function PrivacyScreen() {
  const { updateStep, updatePreferences } = useOnboarding();
  const [consents, setConsents] = useState({
    privacy: false,
    ready: false,
    notifications: false,
  });

  const handleConsentToggle = (key: keyof typeof consents) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNext = () => {
    updatePreferences({ notificationsEnabled: consents.notifications });
    updateStep(2);
  };

  const isNextEnabled = consents.privacy && consents.ready;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF5F7', '#FFE8EB', '#FFF5F7']}
        style={styles.background}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.header}>🛡️ Your glow journey is safe and private</Text>

            <View style={styles.bodyContainer}>
              <Text style={styles.bodyText}>
                Your wellness moments stay just between us - we keep everything encrypted and secure.
              </Text>
              <Text style={styles.bodyText}>
                You control what we track and can export or gently fade away any data whenever you choose.
              </Text>
              <Text style={styles.bodyText}>
                We never share your personal patterns externally without your permission.
              </Text>
            </View>

            {/* Consent Toggles */}
            <View style={styles.consentContainer}>
              <TouchableOpacity
                style={[styles.consentItem, consents.privacy && styles.consentChecked]}
                onPress={() => handleConsentToggle('privacy')}
              >
                <View style={[styles.checkbox, consents.privacy && styles.checkboxChecked]}>
                  {consents.privacy && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.consentText}>
                  I understand my wellness data stays private and secure
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.consentItem, consents.ready && styles.consentChecked]}
                onPress={() => handleConsentToggle('ready')}
              >
                <View style={[styles.checkbox, consents.ready && styles.checkboxChecked]}>
                  {consents.ready && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.consentText}>
                  I'm ready to begin this gentle journey of self-care
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.consentItem, consents.notifications && styles.consentChecked]}
                onPress={() => handleConsentToggle('notifications')}
              >
                <View style={[styles.checkbox, consents.notifications && styles.checkboxChecked]}>
                  {consents.notifications && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.consentText}>
                  Send gentle wellness tips and cat care reminders (no pressure!)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Cat Message Bubble */}
            <View style={styles.messageBubble}>
              <Text style={styles.catMessage}>
                "Your privacy matters to me. I just want to support your glow! 🐾"
              </Text>
            </View>

            <Text style={styles.disclaimer}>
              Your cat's glow reflects gentle wellness patterns, not medical advice.
            </Text>

            <TouchableOpacity
              style={[styles.nextButton, !isNextEnabled && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!isNextEnabled}
            >
              <Text style={[styles.nextButtonText, !isNextEnabled && styles.nextButtonTextDisabled]}>
                Ready to glow
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.activeDot]} />
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
  consentContainer: {
    marginBottom: 32,
  },
  consentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  consentChecked: {
    borderWidth: 2,
    borderColor: Colors.primary.pink,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    marginRight: 12,
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
  consentText: {
    flex: 1,
    fontSize: 16,
    color: Colors.neutral[700],
    lineHeight: 22,
  },
  messageBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 20,
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
  disclaimer: {
    fontSize: 14,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginBottom: 40,
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