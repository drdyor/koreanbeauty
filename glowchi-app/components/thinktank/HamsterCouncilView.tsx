// HamsterCouncilView - The Library scene with clickable hamster areas
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HamsterId, HAMSTER_CONFIG, getAllHamsters } from '../../config/hamsters.config';
import { RoundtableSession } from '../../types';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Invisible tap areas aligned with hamsters in thinktank-bg.jpg
// The image shows 4 hamsters at a round table in a library
const HAMSTER_HOTSPOTS: Record<HamsterId, { top: `${number}%`; left: `${number}%`; width: `${number}%`; height: `${number}%` }> = {
  1: { top: '40%', left: '2%', width: '24%', height: '35%' },   // Left hamster with headband (Al)
  2: { top: '40%', left: '26%', width: '22%', height: '35%' },  // Second from left with glasses (Erik)
  3: { top: '40%', left: '52%', width: '22%', height: '35%' },  // Third hamster (Cogni)
  4: { top: '40%', left: '74%', width: '24%', height: '35%' },  // Right hamster with glasses (Rocky)
};

interface HamsterCouncilViewProps {
  problem: string;
  onProblemChange: (text: string) => void;
  onHamsterSelect: (id: HamsterId) => void;
  onAskAllHamsters: () => void;
  onShowNibblesLog: () => void;
  nibblesCount: number;
  isBigDecision?: boolean;
  onStartDeepDive?: () => void;
  activeRoundtable?: RoundtableSession | null;
  onResumeDeepDive?: () => void;
}

export default function HamsterCouncilView({
  problem,
  onProblemChange,
  onHamsterSelect,
  onAskAllHamsters,
  onShowNibblesLog,
  nibblesCount,
  isBigDecision,
  onStartDeepDive,
  activeRoundtable,
  onResumeDeepDive,
}: HamsterCouncilViewProps) {
  const hamsters = getAllHamsters();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Think Tank</Text>
          <Text style={styles.subtitle}>AI Hamster Advisors</Text>
        </View>
        <TouchableOpacity onPress={onShowNibblesLog} style={styles.nibblesButton}>
          <Ionicons name="time" size={18} color={Colors.primary.purple} />
          <Text style={styles.nibblesText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Problem Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="What's on your mind? Drop your problem here..."
          value={problem}
          onChangeText={onProblemChange}
          multiline
          textAlignVertical="top"
          placeholderTextColor={Colors.text.muted}
        />
      </View>

      {/* Resume Deep Dive - if there's an active session */}
      {activeRoundtable && !activeRoundtable.isComplete && onResumeDeepDive && (
        <TouchableOpacity
          style={styles.resumeDeepDiveButton}
          onPress={onResumeDeepDive}
          activeOpacity={0.8}
        >
          <View style={styles.resumeContent}>
            <View style={styles.resumeIconContainer}>
              <Ionicons name="refresh" size={18} color="white" />
            </View>
            <View style={styles.resumeTextContainer}>
              <Text style={styles.resumeTitle}>Continue Deep Dive</Text>
              <Text style={styles.resumeSubtitle} numberOfLines={1}>
                "{activeRoundtable.problem.slice(0, 35)}..."
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </View>
        </TouchableOpacity>
      )}

      {/* Ask All Hamsters Button - Triggers Consensus Mechanism */}
      {problem.trim().length > 0 && (
        <TouchableOpacity
          style={styles.askAllButton}
          onPress={onAskAllHamsters}
          activeOpacity={0.8}
        >
          <View style={styles.askAllContent}>
            <Text style={styles.askAllEmojis}>🐹🐹🐹🐹</Text>
            <View style={styles.askAllTextContainer}>
              <Text style={styles.askAllTitle}>Ask All Hamsters</Text>
              <Text style={styles.askAllSubtitle}>Get consensus from the full council</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </View>
        </TouchableOpacity>
      )}

      {/* Deep Dive Suggestion - for big decisions */}
      {isBigDecision && onStartDeepDive && problem.trim().length > 0 && (
        <TouchableOpacity
          style={styles.deepDiveButton}
          onPress={onStartDeepDive}
          activeOpacity={0.8}
        >
          <View style={styles.deepDiveContent}>
            <View style={styles.deepDiveIconContainer}>
              <Ionicons name="compass" size={20} color="#1a1a2e" />
            </View>
            <View style={styles.deepDiveTextContainer}>
              <Text style={styles.deepDiveTitle}>Big Decision?</Text>
              <Text style={styles.deepDiveSubtitle}>Try a 4-round Deep Dive investigation</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={Colors.neutral[500]} />
          </View>
        </TouchableOpacity>
      )}

      {/* Hamster Council Image with Clickable Areas */}
      <View style={styles.councilContainer}>
        <ImageBackground
          source={require('../../assets/thinktank-bg.jpg')}
          style={styles.councilImage}
          imageStyle={styles.councilImageStyle}
          resizeMode="cover"
        >
          {/* Invisible tap areas over existing hamsters in the image */}
          {([1, 2, 3, 4] as HamsterId[]).map((id) => {
            const hotspot = HAMSTER_HOTSPOTS[id];

            return (
              <TouchableOpacity
                key={id}
                style={[
                  styles.hotspot,
                  {
                    top: hotspot.top,
                    left: hotspot.left,
                    width: hotspot.width,
                    height: hotspot.height,
                  },
                ]}
                onPress={() => onHamsterSelect(id)}
                activeOpacity={0.6}
              />
            );
          })}
        </ImageBackground>

        <Text style={styles.tapHint}>Tap any hamster to start</Text>
      </View>

      {/* Quick Select Buttons (fallback) */}
      <View style={styles.quickSelect}>
        <Text style={styles.quickSelectLabel}>Or choose directly:</Text>
        <View style={styles.hamsterButtons}>
          {hamsters.map((hamster) => (
            <TouchableOpacity
              key={hamster.id}
              style={[styles.hamsterButton, { backgroundColor: hamster.color }]}
              onPress={() => onHamsterSelect(hamster.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.hamsterButtonIcon}>{hamster.icon}</Text>
              <Text style={styles.hamsterButtonName}>{hamster.defaultName}</Text>
              <Text style={styles.hamsterButtonSchool}>{hamster.school}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Need help choosing?</Text>
        <View style={styles.tipRow}>
          <Text style={styles.tipEmoji}>⚡</Text>
          <Text style={styles.tipText}>Stuck or frozen? → Rocky</Text>
        </View>
        <View style={styles.tipRow}>
          <Text style={styles.tipEmoji}>🧩</Text>
          <Text style={styles.tipText}>Racing mind? → Cogni</Text>
        </View>
        <View style={styles.tipRow}>
          <Text style={styles.tipEmoji}>🟡</Text>
          <Text style={styles.tipText}>Feeling isolated? → Al</Text>
        </View>
        <View style={styles.tipRow}>
          <Text style={styles.tipEmoji}>🔮</Text>
          <Text style={styles.tipText}>Lost direction? → Erik</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  nibblesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nibblesText: {
    marginLeft: 6,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary.purple,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.base,
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    color: Colors.text.primary,
    textAlignVertical: 'top',
  },
  askAllButton: {
    backgroundColor: Colors.primary.purple,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    shadowColor: Colors.primary.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  askAllContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  askAllEmojis: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  askAllTextContainer: {
    flex: 1,
  },
  askAllTitle: {
    fontSize: FontSizes.base,
    fontWeight: 'bold',
    color: 'white',
  },
  askAllSubtitle: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  // Resume Deep Dive button
  resumeDeepDiveButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary.purple,
  },
  resumeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  resumeTextContainer: {
    flex: 1,
  },
  resumeTitle: {
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
    color: 'white',
  },
  resumeSubtitle: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  // Deep Dive suggestion button
  deepDiveButton: {
    backgroundColor: '#FFF9C4',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  deepDiveContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deepDiveIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE082',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  deepDiveTextContainer: {
    flex: 1,
  },
  deepDiveTitle: {
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  deepDiveSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.neutral[600],
    marginTop: 2,
  },
  councilContainer: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
    width: '100%',
  },
  councilImage: {
    width: '100%',
    height: 220,
    position: 'relative',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  councilImageStyle: {
    borderRadius: BorderRadius.lg,
  },
  hotspot: {
    position: 'absolute',
    // Invisible - just a tap target over the hamsters in the image
  },
  tapHint: {
    marginTop: Spacing.sm,
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    fontStyle: 'italic',
  },
  quickSelect: {
    marginBottom: Spacing.lg,
  },
  quickSelectLabel: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  hamsterButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  hamsterButton: {
    width: 100,
    height: 110,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  hamsterButtonIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  hamsterButtonName: {
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
    color: 'white',
  },
  hamsterButtonSchool: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 2,
  },
  tipsContainer: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingVertical: 4,
  },
  tipEmoji: {
    fontSize: 18,
    width: 32,
  },
  tipText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    flex: 1,
  },
});
