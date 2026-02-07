// HypothesesView - Final diagnostic dashboard showing 4 hypotheses and thread profile
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Hypothesis, ThreadProfile, ThreadId, THREAD_COLORS, THREAD_HAMSTER_MAP } from '../../types';
import { HAMSTER_CONFIG } from '../../config/hamsters.config';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HypothesesViewProps {
  hypotheses: Hypothesis[];
  threadProfile: ThreadProfile;
  onComplete: () => void;
  onSaveForLater: () => void;
}

export default function HypothesesView({
  hypotheses,
  threadProfile,
  onComplete,
  onSaveForLater,
}: HypothesesViewProps) {
  const [expandedHypothesis, setExpandedHypothesis] = useState<ThreadId | null>(null);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>The Council's Diagnosis</Text>
        <Text style={styles.subtitle}>4 hypotheses based on your investigation</Text>
      </View>

      {/* Thread Profile Visualization */}
      <View style={styles.profileCard}>
        <Text style={styles.profileTitle}>Your Thread Profile</Text>

        {/* Bar chart visualization */}
        <View style={styles.profileBars}>
          {(['pragmatic', 'psychological', 'analytical', 'social'] as ThreadId[]).map((threadId) => {
            const percentage = threadProfile[threadId];
            const hamster = HAMSTER_CONFIG[THREAD_HAMSTER_MAP[threadId]];
            const isDominant = threadId === threadProfile.dominant;

            return (
              <View key={threadId} style={styles.profileBar}>
                <View style={styles.barLabel}>
                  <Text style={styles.barIcon}>{hamster.icon}</Text>
                  <Text style={[styles.barName, isDominant && styles.barNameDominant]}>
                    {hamster.defaultName}
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${percentage}%`,
                        backgroundColor: THREAD_COLORS[threadId],
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barPercent, { color: THREAD_COLORS[threadId] }]}>
                  {percentage}%
                </Text>
              </View>
            );
          })}
        </View>

        {/* Interpretation */}
        <View style={styles.interpretationBox}>
          <Text style={styles.interpretation}>{threadProfile.interpretation}</Text>
        </View>
      </View>

      {/* Hypotheses Cards */}
      <View style={styles.hypothesesSection}>
        <Text style={styles.sectionTitle}>4 Possible Diagnoses</Text>

        {hypotheses.map((hypothesis) => {
          const hamster = HAMSTER_CONFIG[hypothesis.hamsterId];
          const isExpanded = expandedHypothesis === hypothesis.threadId;
          const isActive = threadProfile[hypothesis.threadId] > 10;

          return (
            <TouchableOpacity
              key={hypothesis.threadId}
              style={[
                styles.hypothesisCard,
                {
                  borderLeftColor: THREAD_COLORS[hypothesis.threadId],
                  opacity: isActive ? 1 : 0.6,
                },
              ]}
              onPress={() => setExpandedHypothesis(isExpanded ? null : hypothesis.threadId)}
              activeOpacity={0.9}
            >
              {/* Header */}
              <View style={styles.hypothesisHeader}>
                <View style={styles.hypothesisTitle}>
                  <Text style={styles.hypothesisIcon}>{hamster.icon}</Text>
                  <Text style={styles.hypothesisName}>{hypothesis.title}</Text>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="rgba(255,255,255,0.5)"
                />
              </View>

              {/* Diagnosis preview */}
              <Text
                style={styles.diagnosisPreview}
                numberOfLines={isExpanded ? undefined : 2}
              >
                {hypothesis.diagnosis}
              </Text>

              {/* Expanded content */}
              {isExpanded && (
                <View style={styles.expandedContent}>
                  <View style={styles.testSection}>
                    <View style={styles.testHeader}>
                      <Ionicons name="flask" size={16} color={Colors.primary.purple} />
                      <Text style={styles.testLabel}>Test:</Text>
                    </View>
                    <Text style={styles.testContent}>{hypothesis.test}</Text>
                  </View>

                  <View style={styles.consequenceSection}>
                    <View style={styles.consequenceHeader}>
                      <Ionicons name="warning" size={16} color={Colors.warning} />
                      <Text style={styles.consequenceLabel}>Consequence:</Text>
                    </View>
                    <Text style={styles.consequenceContent}>{hypothesis.consequence}</Text>
                  </View>
                </View>
              )}

              {/* Not consulted notice */}
              {!isActive && (
                <View style={styles.notConsultedBadge}>
                  <Text style={styles.notConsultedText}>Not enough data</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Action buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={onComplete}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <Text style={styles.completeButtonText}>Complete Investigation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={onSaveForLater}
          activeOpacity={0.8}
        >
          <Ionicons name="bookmark-outline" size={18} color="rgba(255,255,255,0.7)" />
          <Text style={styles.saveButtonText}>Save & Reflect Later</Text>
        </TouchableOpacity>
      </View>

      {/* Guidance note */}
      <View style={styles.guidanceNote}>
        <Ionicons name="information-circle" size={16} color="rgba(255,255,255,0.4)" />
        <Text style={styles.guidanceText}>
          These hypotheses are starting points, not answers. Run the tests before making major decisions.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.6)',
  },

  // Profile card
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  profileTitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: 'white',
    marginBottom: Spacing.md,
  },
  profileBars: {
    gap: Spacing.sm,
  },
  profileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  barLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  barIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  barName: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  barNameDominant: {
    fontWeight: 'bold',
    color: 'white',
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barPercent: {
    width: 40,
    fontSize: FontSizes.xs,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  interpretationBox: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  interpretation: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Hypotheses section
  hypothesesSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hypothesisCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    position: 'relative',
  },
  hypothesisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  hypothesisTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hypothesisIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  hypothesisName: {
    fontSize: FontSizes.base,
    fontWeight: 'bold',
    color: 'white',
  },
  diagnosisPreview: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  expandedContent: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: Spacing.md,
  },
  testSection: {},
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  testLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.primary.purple,
    textTransform: 'uppercase',
  },
  testContent: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    paddingLeft: 22,
  },
  consequenceSection: {},
  consequenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  consequenceLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.warning,
    textTransform: 'uppercase',
  },
  consequenceContent: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    paddingLeft: 22,
  },
  notConsultedBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  notConsultedText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },

  // Action section
  actionSection: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.purple,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  completeButtonText: {
    fontSize: FontSizes.base,
    fontWeight: 'bold',
    color: 'white',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  saveButtonText: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.7)',
  },

  // Guidance note
  guidanceNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  guidanceText: {
    flex: 1,
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 16,
  },
});
