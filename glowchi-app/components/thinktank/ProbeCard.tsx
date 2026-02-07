// ProbeCard - Individual hamster question card for Deep Dive mode
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exchange, THREAD_COLORS, HAMSTER_THREAD_MAP } from '../../types';
import { HAMSTER_CONFIG } from '../../config/hamsters.config';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants';

interface ProbeCardProps {
  exchange: Exchange;
  onSelect: () => void;
  isSelected?: boolean;
  isSulking?: boolean;
}

export default function ProbeCard({
  exchange,
  onSelect,
  isSelected,
  isSulking,
}: ProbeCardProps) {
  const hamster = HAMSTER_CONFIG[exchange.hamsterId];
  const threadId = HAMSTER_THREAD_MAP[exchange.hamsterId];
  const threadColor = THREAD_COLORS[threadId];

  // Different styles for different exchange types
  const isInterrupt = exchange.type === 'interrupt';
  const isFollowUp = exchange.type === 'follow_up';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.containerSelected,
        isSulking && styles.containerSulking,
        { borderLeftColor: threadColor },
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
      disabled={isSulking}
    >
      {/* Header with hamster info */}
      <View style={styles.header}>
        <View style={[styles.hamsterBadge, { backgroundColor: isSulking ? Colors.neutral[500] : hamster.color }]}>
          <Text style={styles.hamsterIcon}>{hamster.icon}</Text>
          <Text style={styles.hamsterName}>{hamster.defaultName}</Text>
        </View>

        {isInterrupt && (
          <View style={styles.interruptBadge}>
            <Ionicons name="hand-right" size={12} color={Colors.warning} />
            <Text style={styles.interruptText}>Interrupts</Text>
          </View>
        )}

        {isFollowUp && (
          <View style={styles.followUpBadge}>
            <Ionicons name="arrow-redo" size={12} color={Colors.primary.purple} />
            <Text style={styles.followUpText}>Follow-up</Text>
          </View>
        )}

        {isSulking && (
          <View style={styles.sulkBadge}>
            <Text style={styles.sulkText}>Ignored</Text>
          </View>
        )}
      </View>

      {/* Question content */}
      <Text style={[styles.question, isSulking && styles.questionSulking]}>
        {exchange.content}
      </Text>

      {/* Action indicator */}
      {!isSulking && (
        <View style={styles.actionRow}>
          <Text style={styles.actionText}>Tap to answer</Text>
          <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.5)" />
        </View>
      )}

      {/* School label */}
      <Text style={styles.schoolLabel}>{hamster.school}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.purple,
  },
  containerSelected: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  containerSulking: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  hamsterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  hamsterIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  hamsterName: {
    fontSize: FontSizes.xs,
    fontWeight: 'bold',
    color: 'white',
  },
  interruptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.2)',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  interruptText: {
    fontSize: 10,
    color: Colors.warning,
    fontWeight: '600',
  },
  followUpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168,85,247,0.2)',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  followUpText: {
    fontSize: 10,
    color: Colors.primary.purple,
    fontWeight: '600',
  },
  sulkBadge: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  sulkText: {
    fontSize: 10,
    color: Colors.error,
    fontWeight: '600',
  },
  question: {
    fontSize: FontSizes.base,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  questionSulking: {
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actionText: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.5)',
    marginRight: 4,
  },
  schoolLabel: {
    position: 'absolute',
    bottom: Spacing.xs,
    left: Spacing.md,
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
