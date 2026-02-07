// CouncilResultView - Displays the 3-stage hamster council consensus results
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { HAMSTER_CONFIG, HamsterId } from '../../config/hamsters.config';
import { CouncilResult } from '../../services/hamsterService';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type StageTab = 'individual' | 'reviews' | 'consensus';

interface CouncilResultViewProps {
  result: CouncilResult | null;
  isLoading: boolean;
  problem: string;
  onClose: () => void;
}

export default function CouncilResultView({
  result,
  isLoading,
  problem,
  onClose,
}: CouncilResultViewProps) {
  const [activeStage, setActiveStage] = useState<StageTab>('consensus');
  const [selectedHamster, setSelectedHamster] = useState<HamsterId>(1);

  // Generate deliberation dialogue for loading state
  const deliberationExchanges = useMemo(() => [
    { hamsterId: 3 as HamsterId, name: 'Cogni', text: "Interesting problem... let me analyze the thought patterns here." },
    { hamsterId: 1 as HamsterId, name: 'Al', text: "I sense some underlying social dynamics at play." },
    { hamsterId: 4 as HamsterId, name: 'Rocky', text: "What actions have you already tried? That's what matters." },
    { hamsterId: 2 as HamsterId, name: 'Erik', text: "There's a deeper meaning here... let's explore the stages." },
    { hamsterId: 3 as HamsterId, name: 'Cogni', text: "I disagree with Rocky - we need to understand before acting!" },
    { hamsterId: 4 as HamsterId, name: 'Rocky', text: "Understanding without action is just rumination, Cogni." },
  ], []);

  const [currentDelibIndex, setCurrentDelibIndex] = useState(0);

  // Advance deliberation dialogue
  React.useEffect(() => {
    if (!isLoading) return;
    if (currentDelibIndex >= deliberationExchanges.length) return;

    const timer = setTimeout(() => {
      setCurrentDelibIndex(prev => prev + 1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoading, currentDelibIndex, deliberationExchanges.length]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        {/* Council Video */}
        <View style={styles.videoContainer}>
          <Video
            source={require('../../assets/hamster-council-1.mp4')}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            isMuted
          />
          <View style={styles.videoOverlay} />
          <View style={styles.videoTitle}>
            <Text style={styles.videoTitleText}>🐹 The Council Deliberates</Text>
          </View>
        </View>

        {/* Deliberation dialogue */}
        <ScrollView style={styles.deliberationScroll} contentContainerStyle={styles.deliberationContent}>
          {deliberationExchanges.slice(0, currentDelibIndex).map((exchange, index) => {
            const hamster = HAMSTER_CONFIG[exchange.hamsterId];
            return (
              <View
                key={index}
                style={[styles.deliberationBubble, { borderLeftColor: hamster.color }]}
              >
                <View style={styles.deliberationHeader}>
                  <Text style={styles.deliberationIcon}>{hamster.icon}</Text>
                  <Text style={[styles.deliberationName, { color: hamster.color }]}>
                    {exchange.name}
                  </Text>
                </View>
                <Text style={styles.deliberationText}>{exchange.text}</Text>
              </View>
            );
          })}

          {/* Typing indicator */}
          {currentDelibIndex < deliberationExchanges.length && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingDots}>...</Text>
            </View>
          )}
        </ScrollView>

        {/* Loading indicator */}
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color={Colors.primary.purple} />
          <Text style={styles.loadingBarText}>Hamsters are forming consensus...</Text>
        </View>
      </View>
    );
  }

  if (!result) {
    return null;
  }

  const chairman = HAMSTER_CONFIG[result.chairmanId];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Council Consensus</Text>
          <Text style={styles.subtitle}>4 hamsters deliberated on your problem</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Problem recap */}
      <View style={styles.problemCard}>
        <Text style={styles.problemLabel}>Your Problem</Text>
        <Text style={styles.problemText}>{problem}</Text>
      </View>

      {/* Stage Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeStage === 'consensus' && styles.tabActive]}
          onPress={() => setActiveStage('consensus')}
        >
          <Text style={[styles.tabText, activeStage === 'consensus' && styles.tabTextActive]}>
            Final Answer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeStage === 'individual' && styles.tabActive]}
          onPress={() => setActiveStage('individual')}
        >
          <Text style={[styles.tabText, activeStage === 'individual' && styles.tabTextActive]}>
            Individual
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeStage === 'reviews' && styles.tabActive]}
          onPress={() => setActiveStage('reviews')}
        >
          <Text style={[styles.tabText, activeStage === 'reviews' && styles.tabTextActive]}>
            Rankings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeStage === 'consensus' && (
          <View style={styles.consensusSection}>
            {/* Chairman badge */}
            <View style={[styles.chairmanBadge, { backgroundColor: chairman.color }]}>
              <Text style={styles.chairmanIcon}>{chairman.icon}</Text>
              <Text style={styles.chairmanName}>
                {chairman.defaultName} (Chairman)
              </Text>
            </View>

            {/* Final synthesis */}
            <View style={styles.synthesisCard}>
              <Text style={styles.synthesisText}>{result.stage3}</Text>
            </View>

            {/* Aggregate Rankings */}
            {result.aggregateRankings.length > 0 && (
              <View style={styles.rankingsCard}>
                <Text style={styles.rankingsTitle}>Council Rankings</Text>
                <Text style={styles.rankingsSubtitle}>
                  Who gave the most helpful advice?
                </Text>
                {result.aggregateRankings.map((rank, index) => {
                  const hamster = HAMSTER_CONFIG[rank.hamsterId];
                  return (
                    <View key={rank.hamsterId} style={styles.rankRow}>
                      <Text style={styles.rankPosition}>#{index + 1}</Text>
                      <View style={[styles.rankBadge, { backgroundColor: hamster.color }]}>
                        <Text style={styles.rankIcon}>{hamster.icon}</Text>
                      </View>
                      <Text style={styles.rankName}>{rank.hamsterName}</Text>
                      <Text style={styles.rankScore}>
                        avg: {rank.averageRank.toFixed(1)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {activeStage === 'individual' && (
          <View style={styles.individualSection}>
            {/* Hamster selector */}
            <View style={styles.hamsterSelector}>
              {([1, 2, 3, 4] as HamsterId[]).map((id) => {
                const hamster = HAMSTER_CONFIG[id];
                const isSelected = selectedHamster === id;
                return (
                  <TouchableOpacity
                    key={id}
                    style={[
                      styles.hamsterTab,
                      { borderColor: hamster.color },
                      isSelected && { backgroundColor: hamster.color },
                    ]}
                    onPress={() => setSelectedHamster(id)}
                  >
                    <Text style={styles.hamsterTabIcon}>{hamster.icon}</Text>
                    <Text
                      style={[
                        styles.hamsterTabName,
                        isSelected && styles.hamsterTabNameActive,
                      ]}
                    >
                      {hamster.defaultName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selected hamster's response */}
            {result.stage1.map((response) => {
              if (response.hamsterId !== selectedHamster) return null;
              const hamster = HAMSTER_CONFIG[response.hamsterId];
              return (
                <View key={response.hamsterId} style={styles.responseCard}>
                  <View style={styles.responseHeader}>
                    <View style={[styles.responseBadge, { backgroundColor: hamster.color }]}>
                      <Text style={styles.responseIcon}>{hamster.icon}</Text>
                      <Text style={styles.responseName}>{hamster.defaultName}</Text>
                    </View>
                    <Text style={styles.responseSchool}>{hamster.school}</Text>
                  </View>
                  <Text style={styles.responseText}>{response.response}</Text>
                </View>
              );
            })}
          </View>
        )}

        {activeStage === 'reviews' && (
          <View style={styles.reviewsSection}>
            <Text style={styles.reviewsExplainer}>
              Each hamster anonymously reviewed and ranked the others' advice.
              This creates consensus on what's most helpful.
            </Text>

            {result.stage2.map((ranking) => {
              const hamster = HAMSTER_CONFIG[ranking.hamsterId];
              return (
                <View key={ranking.hamsterId} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={[styles.reviewBadge, { backgroundColor: hamster.color }]}>
                      <Text style={styles.reviewIcon}>{hamster.icon}</Text>
                      <Text style={styles.reviewName}>{hamster.defaultName}'s Review</Text>
                    </View>
                  </View>

                  {/* Parsed ranking */}
                  {ranking.parsedRanking.length > 0 && (
                    <View style={styles.parsedRanking}>
                      <Text style={styles.parsedRankingTitle}>Their Ranking:</Text>
                      {ranking.parsedRanking.map((label, i) => {
                        const rankedHamsterId = result.labelToHamster[label];
                        const rankedHamster = rankedHamsterId
                          ? HAMSTER_CONFIG[rankedHamsterId]
                          : null;
                        return (
                          <Text key={i} style={styles.parsedRankingItem}>
                            {i + 1}. {rankedHamster ? `${rankedHamster.icon} ${rankedHamster.defaultName}` : label}
                          </Text>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.soft,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  // Video deliberation styles
  videoContainer: {
    width: '100%',
    height: Math.min(SCREEN_WIDTH * 0.5, 250),
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  videoTitle: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  videoTitleText: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  deliberationScroll: {
    flex: 1,
  },
  deliberationContent: {
    padding: Spacing.md,
    paddingBottom: 80,
  },
  deliberationBubble: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  deliberationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  deliberationIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  deliberationName: {
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
  },
  deliberationText: {
    fontSize: FontSizes.base,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  typingIndicator: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  typingDots: {
    fontSize: 20,
    color: 'white',
    letterSpacing: 4,
  },
  loadingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(165, 145, 255, 0.2)',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  loadingBarText: {
    fontSize: FontSizes.sm,
    color: 'white',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  problemCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: 'white',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.purple,
  },
  problemLabel: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  problemText: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary.purple,
  },
  tabText: {
    fontSize: FontSizes.sm,
    color: Colors.text.muted,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.primary.purple,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  // Consensus Stage
  consensusSection: {},
  chairmanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  chairmanIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  chairmanName: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: 'white',
  },
  synthesisCard: {
    backgroundColor: '#f0fff0',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  synthesisText: {
    fontSize: FontSizes.base,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  rankingsCard: {
    backgroundColor: 'white',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  rankingsTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  rankingsSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    marginBottom: Spacing.md,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  rankPosition: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.text.secondary,
    width: 30,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  rankIcon: {
    fontSize: 14,
  },
  rankName: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  rankScore: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
  },
  // Individual Stage
  individualSection: {},
  hamsterSelector: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  hamsterTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginHorizontal: 2,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    backgroundColor: 'white',
  },
  hamsterTabIcon: {
    fontSize: 18,
  },
  hamsterTabName: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginTop: 2,
  },
  hamsterTabNameActive: {
    color: 'white',
  },
  responseCard: {
    backgroundColor: 'white',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  responseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  responseIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  responseName: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: 'white',
  },
  responseSchool: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
  },
  responseText: {
    fontSize: FontSizes.base,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  // Reviews Stage
  reviewsSection: {},
  reviewsExplainer: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
    fontStyle: 'italic',
  },
  reviewCard: {
    backgroundColor: 'white',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  reviewHeader: {
    marginBottom: Spacing.sm,
  },
  reviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  reviewIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  reviewName: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: 'white',
  },
  parsedRanking: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  parsedRankingTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  parsedRankingItem: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
    marginBottom: 2,
  },
});
