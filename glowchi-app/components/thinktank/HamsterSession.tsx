// HamsterSession - Session screen with hamster response and signature tool
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  HamsterId,
  HAMSTER_CONFIG,
  VOICE_TEMPLATES,
} from '../../config/hamsters.config';
import { getHamsterResponse, checkForCrisis, HamsterResponse } from '../../services/hamsterService';
import { renderTool } from './SignatureTools';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants';

type SessionStep = 'loading' | 'intro' | 'tool' | 'complete';

interface HamsterSessionProps {
  hamsterId: HamsterId;
  problem: string;
  onBack: () => void;
  onComplete: (result: {
    hamsterId: HamsterId;
    problem: string;
    toolResult: Record<string, string>;
    hamsterResponse: string;
  }) => void;
  onSwitchHamster: (id: HamsterId) => void;
}

export default function HamsterSession({
  hamsterId,
  problem,
  onBack,
  onComplete,
  onSwitchHamster,
}: HamsterSessionProps) {
  const [step, setStep] = useState<SessionStep>('loading');
  const [hamsterResponse, setHamsterResponse] = useState<HamsterResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [showOtherHamsters, setShowOtherHamsters] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const hamster = HAMSTER_CONFIG[hamsterId];
  const voice = VOICE_TEMPLATES[hamster.voiceStyle];
  const hasCrisis = checkForCrisis(problem);

  useEffect(() => {
    fetchHamsterResponse();
  }, [hamsterId]);

  const fetchHamsterResponse = async () => {
    setStep('loading');
    setError('');

    try {
      const response = await getHamsterResponse(hamsterId, problem);
      setHamsterResponse(response);
      setStep('intro');

      // Animate in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (err: any) {
      setError(err.message || 'Failed to get response');
      setStep('intro');
    }
  };

  const handleToolComplete = (toolResult: Record<string, string>) => {
    setStep('complete');
    onComplete({
      hamsterId,
      problem,
      toolResult,
      hamsterResponse: hamsterResponse?.response || '',
    });
  };

  const renderContent = () => {
    if (step === 'loading') {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={hamster.color} />
          <Text style={styles.loadingText}>Asking {hamster.defaultName}...</Text>
        </View>
      );
    }

    if (step === 'intro') {
      return (
        <Animated.View style={[styles.introContainer, { opacity: fadeAnim }]}>
          {/* Crisis Warning */}
          {hasCrisis && (
            <View style={styles.crisisWarning}>
              <Ionicons name="warning" size={24} color="#856404" />
              <View style={styles.crisisTextContainer}>
                <Text style={styles.crisisTitle}>Important Note</Text>
                <Text style={styles.crisisText}>
                  If you're in crisis, please reach out to a professional or crisis hotline.
                  The hamsters are here for everyday challenges.
                </Text>
              </View>
            </View>
          )}

          {/* Problem Display */}
          {problem && (
            <View style={styles.problemCard}>
              <Text style={styles.problemLabel}>Your problem:</Text>
              <Text style={styles.problemText}>{problem}</Text>
            </View>
          )}

          {/* Hamster Response Bubble */}
          <View style={[styles.responseBubble, { borderLeftColor: hamster.color }]}>
            <View style={styles.responseHeader}>
              <View style={[styles.responseIconContainer, { backgroundColor: hamster.color }]}>
                <Text style={styles.responseIcon}>{hamster.icon}</Text>
              </View>
              <View>
                <Text style={styles.responseName}>{hamster.defaultName}</Text>
                <Text style={styles.responseSchool}>{hamster.school}</Text>
              </View>
            </View>
            <Text style={styles.responseText}>
              {hamsterResponse?.response || voice.opener}
            </Text>
            {hamsterResponse?.isMock && (
              <Text style={styles.mockBadge}>Demo Mode</Text>
            )}
          </View>

          {/* Tool Preview */}
          <View style={styles.toolPreview}>
            <Text style={styles.toolPreviewTitle}>
              Ready to use: {hamster.signatureTool}
            </Text>
            <Text style={styles.toolPreviewDesc}>{hamster.description}</Text>
          </View>

          {/* Start Tool Button */}
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: hamster.color }]}
            onPress={() => setStep('tool')}
          >
            <Text style={styles.startButtonText}>
              Start {hamster.signatureTool}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>

          {/* Switch Hamster */}
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setShowOtherHamsters(!showOtherHamsters)}
          >
            <Text style={styles.switchButtonText}>
              {showOtherHamsters ? 'Hide other perspectives' : 'Hear other perspectives?'}
            </Text>
          </TouchableOpacity>

          {showOtherHamsters && (
            <View style={styles.otherHamsters}>
              {([1, 2, 3, 4] as HamsterId[])
                .filter((id) => id !== hamsterId)
                .map((id) => {
                  const other = HAMSTER_CONFIG[id];
                  return (
                    <TouchableOpacity
                      key={id}
                      style={[styles.otherHamsterCard, { borderColor: other.color }]}
                      onPress={() => onSwitchHamster(id)}
                    >
                      <Text style={styles.otherHamsterIcon}>{other.icon}</Text>
                      <View style={styles.otherHamsterInfo}>
                        <Text style={styles.otherHamsterName}>{other.defaultName}</Text>
                        <Text style={styles.otherHamsterSchool}>{other.school}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </View>
          )}
        </Animated.View>
      );
    }

    if (step === 'tool') {
      return renderTool(hamster.signatureTool, hamster.color, handleToolComplete);
    }

    if (step === 'complete') {
      return (
        <View style={styles.completeContainer}>
          <View style={styles.completeIcon}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
          </View>
          <Text style={styles.completeTitle}>Session Complete!</Text>
          <Text style={styles.completeSubtitle}>
            You earned <Text style={styles.nibbleHighlight}>1 Nibble</Text>
          </Text>
          <Text style={styles.completeQuote}>{voice.closer}</Text>

          <View style={styles.completeButtons}>
            <TouchableOpacity
              style={[styles.againButton, { backgroundColor: hamster.color }]}
              onPress={() => setStep('intro')}
            >
              <Text style={styles.againButtonText}>Talk Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneButton} onPress={onBack}>
              <Text style={styles.doneButtonText}>Back to Council</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerName}>{hamster.defaultName}</Text>
          <Text style={styles.headerSchool}>{hamster.school}</Text>
        </View>
        <View style={[styles.headerIcon, { backgroundColor: hamster.color }]}>
          <Text style={styles.headerIconText}>{hamster.icon}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.soft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    alignItems: 'center',
    flex: 1,
  },
  headerName: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  headerSchool: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  headerIconText: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
  },
  introContainer: {
    flex: 1,
  },
  crisisWarning: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  crisisTextContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  crisisTitle: {
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  crisisText: {
    fontSize: FontSizes.xs,
    color: '#856404',
    lineHeight: 18,
  },
  problemCard: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  problemLabel: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  problemText: {
    fontSize: FontSizes.base,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  responseBubble: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    marginBottom: Spacing.lg,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    position: 'relative',
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  responseIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  responseIcon: {
    fontSize: 36,
  },
  responseName: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  responseSchool: {
    fontSize: FontSizes.sm,
    color: Colors.text.muted,
    marginTop: 2,
  },
  responseText: {
    fontSize: FontSizes.lg,
    color: Colors.text.primary,
    lineHeight: 28,
  },
  mockBadge: {
    marginTop: Spacing.sm,
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    fontStyle: 'italic',
  },
  toolPreview: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  toolPreviewTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  toolPreviewDesc: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: FontSizes.lg,
    marginRight: Spacing.sm,
  },
  switchButton: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  switchButtonText: {
    fontSize: FontSizes.sm,
    color: Colors.primary.purple,
  },
  otherHamsters: {
    marginTop: Spacing.md,
  },
  otherHamsterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
  },
  otherHamsterIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  otherHamsterInfo: {
    flex: 1,
  },
  otherHamsterName: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  otherHamsterSchool: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  completeIcon: {
    marginBottom: Spacing.lg,
  },
  completeTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  completeSubtitle: {
    fontSize: FontSizes.lg,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  nibbleHighlight: {
    fontWeight: 'bold',
    color: Colors.primary.purple,
  },
  completeQuote: {
    fontSize: FontSizes.base,
    color: Colors.text.muted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  completeButtons: {
    width: '100%',
  },
  againButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  againButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: FontSizes.base,
  },
  doneButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
  },
  doneButtonText: {
    color: Colors.text.primary,
    fontWeight: '600',
    fontSize: FontSizes.base,
  },
});
