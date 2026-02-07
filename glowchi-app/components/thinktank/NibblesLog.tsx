// NibblesLog - Progress tracking for hamster sessions
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HamsterId, HAMSTER_CONFIG } from '../../config/hamsters.config';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants';

export interface NibbleSession {
  id: string;
  hamsterId: HamsterId;
  problem: string;
  toolUsed: string;
  toolResult: Record<string, string>;
  hamsterResponse: string;
  timestamp: string;
  nibblesEarned: number;
}

interface NibblesLogProps {
  sessions: NibbleSession[];
  onBack: () => void;
  onClearHistory?: () => void;
}

export default function NibblesLog({ sessions, onBack, onClearHistory }: NibblesLogProps) {
  // Calculate stats
  const stats = useMemo(() => {
    const totalNibbles = sessions.reduce((sum, s) => sum + s.nibblesEarned, 0);
    const hamsterUsage: Record<HamsterId, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };

    sessions.forEach((s) => {
      hamsterUsage[s.hamsterId]++;
    });

    // Find most used hamster
    let mostUsedId: HamsterId = 1;
    let maxUsage = 0;
    (Object.entries(hamsterUsage) as [string, number][]).forEach(([id, count]) => {
      if (count > maxUsage) {
        maxUsage = count;
        mostUsedId = Number(id) as HamsterId;
      }
    });

    return {
      totalNibbles,
      totalSessions: sessions.length,
      hamsterUsage,
      mostUsedId: maxUsage > 0 ? mostUsedId : null,
    };
  }, [sessions]);

  // Generate insights
  const insights = useMemo(() => {
    const result: string[] = [];

    if (stats.mostUsedId) {
      const hamster = HAMSTER_CONFIG[stats.mostUsedId];
      result.push(`You use ${hamster.defaultName} most often (${stats.hamsterUsage[stats.mostUsedId]} times)`);
    }

    if (stats.totalSessions >= 3) {
      result.push("You're building a practice! Keep going.");
    }

    if (stats.totalSessions >= 7) {
      result.push("A week of growth! You're developing self-awareness.");
    }

    // Check for hamster variety
    const usedHamsters = Object.values(stats.hamsterUsage).filter((n) => n > 0).length;
    if (usedHamsters >= 3) {
      result.push("Great variety! You're exploring different perspectives.");
    } else if (stats.totalSessions >= 5 && usedHamsters < 2) {
      result.push("Try another hamster for a fresh perspective!");
    }

    return result;
  }, [stats]);

  const renderSession = ({ item }: { item: NibbleSession }) => {
    const hamster = HAMSTER_CONFIG[item.hamsterId];
    const date = new Date(item.timestamp);

    return (
      <View style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <View style={[styles.hamsterBadge, { backgroundColor: hamster.color }]}>
            <Text style={styles.hamsterBadgeIcon}>{hamster.icon}</Text>
            <Text style={styles.hamsterBadgeName}>{hamster.defaultName}</Text>
          </View>
          <Text style={styles.sessionDate}>
            {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </Text>
        </View>

        <Text style={styles.sessionTool}>Tool: {item.toolUsed}</Text>

        {item.problem && (
          <Text style={styles.sessionProblem} numberOfLines={2}>
            {item.problem}
          </Text>
        )}

        {item.toolResult && Object.keys(item.toolResult).length > 0 && (
          <View style={styles.sessionResult}>
            <Text style={styles.sessionResultLabel}>Key insight:</Text>
            <Text style={styles.sessionResultText} numberOfLines={2}>
              {Object.values(item.toolResult)[0] || 'Session completed'}
            </Text>
          </View>
        )}

        <View style={styles.sessionFooter}>
          <View style={styles.nibbleEarned}>
            <Ionicons name="trophy" size={14} color={Colors.primary.purple} />
            <Text style={styles.nibbleEarnedText}>+{item.nibblesEarned} pts</Text>
          </View>
        </View>
      </View>
    );
  };

  const ListHeader = () => (
    <>
      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalNibbles}</Text>
          <Text style={styles.statLabel}>Total Points</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalSessions}</Text>
          <Text style={styles.statLabel}>Conversations</Text>
        </View>
      </View>

      {/* Hamster Usage */}
      <View style={styles.usageSection}>
        <Text style={styles.usageTitle}>Hamster Usage</Text>
        <View style={styles.usageRow}>
          {([1, 2, 3, 4] as HamsterId[]).map((id) => {
            const hamster = HAMSTER_CONFIG[id];
            const count = stats.hamsterUsage[id];
            return (
              <View key={id} style={styles.usageItem}>
                <View style={[styles.usageIcon, { backgroundColor: hamster.color }]}>
                  <Text style={styles.usageIconText}>{hamster.icon}</Text>
                </View>
                <Text style={styles.usageCount}>{count}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Insights */}
      {insights.length > 0 && (
        <View style={styles.insightsSection}>
          <Text style={styles.insightsTitle}>Your Patterns</Text>
          {insights.map((insight, idx) => (
            <View key={idx} style={styles.insightRow}>
              <Ionicons name="bulb" size={16} color={Colors.primary.purple} />
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Section Header */}
      <Text style={styles.historyTitle}>Session History</Text>
    </>
  );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={48} color={Colors.neutral[300]} />
      <Text style={styles.emptyTitle}>No sessions yet</Text>
      <Text style={styles.emptyText}>
        Start a conversation with the hamster advisors!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session History</Text>
        {onClearHistory && sessions.length > 0 && (
          <TouchableOpacity onPress={onClearHistory} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={20} color={Colors.text.muted} />
          </TouchableOpacity>
        )}
        {!onClearHistory && <View style={styles.headerSpacer} />}
      </View>

      {/* Content */}
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderSession}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  clearButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginHorizontal: Spacing.xs,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statNumber: {
    fontSize: FontSizes['3xl'],
    fontWeight: 'bold',
    color: Colors.primary.purple,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    marginTop: Spacing.xs,
    textTransform: 'uppercase',
  },
  usageSection: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  usageTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  usageItem: {
    alignItems: 'center',
  },
  usageIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  usageIconText: {
    fontSize: 26,
  },
  usageCount: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  insightsSection: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  insightsTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  insightText: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  historyTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text.muted,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  hamsterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  hamsterBadgeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  hamsterBadgeName: {
    fontSize: FontSizes.xs,
    fontWeight: 'bold',
    color: 'white',
  },
  sessionDate: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
  },
  sessionTool: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    marginBottom: Spacing.sm,
  },
  sessionProblem: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  sessionResult: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sessionResultLabel: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    marginBottom: 2,
  },
  sessionResultText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  nibbleEarned: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nibbleEarnedText: {
    marginLeft: 4,
    fontSize: FontSizes.xs,
    color: Colors.primary.purple,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSizes.base,
    color: Colors.text.muted,
    textAlign: 'center',
  },
});
