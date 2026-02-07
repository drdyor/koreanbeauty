// CouncilDebate - Shows hamsters arguing with each other in Deep Dive mode
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exchange, ThreadId, THREAD_COLORS, HAMSTER_THREAD_MAP } from '../../types';
import { HamsterId, HAMSTER_CONFIG } from '../../config/hamsters.config';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants';

interface CouncilDebateProps {
  exchanges: Exchange[];
  onSelectConcern: (threadId: ThreadId) => void;
  isLoading?: boolean;
}

export default function CouncilDebate({
  exchanges,
  onSelectConcern,
  isLoading,
}: CouncilDebateProps) {
  const [visibleExchanges, setVisibleExchanges] = useState<number>(0);
  const [showChoice, setShowChoice] = useState(false);

  // Animate exchanges appearing one by one
  useEffect(() => {
    if (visibleExchanges < exchanges.length) {
      const timer = setTimeout(() => {
        setVisibleExchanges(v => v + 1);
      }, 1500); // 1.5 second delay between exchanges
      return () => clearTimeout(timer);
    } else if (visibleExchanges === exchanges.length && exchanges.length > 0) {
      // Show choice after all exchanges
      const timer = setTimeout(() => {
        setShowChoice(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [visibleExchanges, exchanges.length]);

  // Get unique hamsters involved in the debate
  const debatingHamsters = [...new Set(exchanges.map(e => e.hamsterId))];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>The Council Splits</Text>
        <Text style={styles.subtitle}>The hamsters disagree about your situation</Text>
      </View>

      {/* Debate visualization */}
      <View style={styles.debateArena}>
        {/* Hamster avatars at top */}
        <View style={styles.debaters}>
          {debatingHamsters.map((hamsterId) => {
            const hamster = HAMSTER_CONFIG[hamsterId];
            const threadId = HAMSTER_THREAD_MAP[hamsterId];
            return (
              <View key={hamsterId} style={styles.debater}>
                <View style={[styles.debaterAvatar, { backgroundColor: hamster.color }]}>
                  <Text style={styles.debaterIcon}>{hamster.icon}</Text>
                </View>
                <Text style={styles.debaterName}>{hamster.defaultName}</Text>
              </View>
            );
          })}
        </View>

        {/* Debate exchanges */}
        <View style={styles.exchanges}>
          {exchanges.slice(0, visibleExchanges).map((exchange, index) => (
            <DebateBubble key={exchange.id} exchange={exchange} index={index} />
          ))}

          {/* Typing indicator */}
          {visibleExchanges < exchanges.length && (
            <View style={styles.typingIndicator}>
              <View style={styles.typingDot} />
              <View style={[styles.typingDot, styles.typingDotDelay1]} />
              <View style={[styles.typingDot, styles.typingDotDelay2]} />
            </View>
          )}
        </View>
      </View>

      {/* Choice prompt */}
      {showChoice && !isLoading && (
        <View style={styles.choiceContainer}>
          <Text style={styles.choiceTitle}>Which concern matters most to you?</Text>
          <Text style={styles.choiceSubtitle}>Your answer will shape the final hypotheses</Text>

          <View style={styles.choiceButtons}>
            {debatingHamsters.map((hamsterId) => {
              const hamster = HAMSTER_CONFIG[hamsterId];
              const threadId = HAMSTER_THREAD_MAP[hamsterId];
              return (
                <TouchableOpacity
                  key={hamsterId}
                  style={[styles.choiceButton, { borderColor: THREAD_COLORS[threadId] }]}
                  onPress={() => onSelectConcern(threadId)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.choiceButtonIcon, { color: THREAD_COLORS[threadId] }]}>
                    {hamster.icon}
                  </Text>
                  <Text style={styles.choiceButtonName}>{hamster.defaultName}'s concern</Text>
                  <Text style={styles.choiceButtonDesc}>{getConcernLabel(threadId)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Skip option */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => onSelectConcern(HAMSTER_THREAD_MAP[debatingHamsters[0]])}
          >
            <Text style={styles.skipText}>I don't know / Ask me something else</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// Individual debate bubble
function DebateBubble({ exchange, index }: { exchange: Exchange; index: number }) {
  const hamster = HAMSTER_CONFIG[exchange.hamsterId];
  const threadId = HAMSTER_THREAD_MAP[exchange.hamsterId];
  const isLeft = index % 2 === 0;

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(isLeft ? -20 : 20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubble,
        isLeft ? styles.bubbleLeft : styles.bubbleRight,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
          backgroundColor: `${THREAD_COLORS[threadId]}20`,
          borderColor: THREAD_COLORS[threadId],
        },
      ]}
    >
      {/* Speaker indicator */}
      <View style={styles.bubbleSpeaker}>
        <Text style={styles.bubbleIcon}>{hamster.icon}</Text>
        <Text style={[styles.bubbleName, { color: THREAD_COLORS[threadId] }]}>
          {hamster.defaultName}
        </Text>
      </View>

      {/* Content */}
      <Text style={styles.bubbleContent}>{exchange.content}</Text>
    </Animated.View>
  );
}

function getConcernLabel(threadId: ThreadId): string {
  switch (threadId) {
    case 'pragmatic':
      return 'Money, scale, practical realities';
    case 'psychological':
      return 'Identity, meaning, life stage';
    case 'analytical':
      return 'Data, evidence, verification';
    case 'social':
      return 'Relationships, belonging, people';
    default:
      return '';
  }
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
  debateArena: {
    marginBottom: Spacing.xl,
  },
  debaters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  debater: {
    alignItems: 'center',
  },
  debaterAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  debaterIcon: {
    fontSize: 32,
  },
  debaterName: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
  },
  exchanges: {
    gap: Spacing.md,
  },
  bubble: {
    maxWidth: '88%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  bubbleLeft: {
    alignSelf: 'flex-start',
    borderTopLeftRadius: 6,
  },
  bubbleRight: {
    alignSelf: 'flex-end',
    borderTopRightRadius: 6,
  },
  bubbleSpeaker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  bubbleIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  bubbleName: {
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
  },
  bubbleContent: {
    fontSize: FontSizes.base,
    color: 'rgba(255,255,255,0.95)',
    lineHeight: 24,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: Spacing.sm,
    gap: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    animationName: 'pulse',
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
  },
  typingDotDelay1: {
    animationDelay: '0.2s',
  },
  typingDotDelay2: {
    animationDelay: '0.4s',
  },
  choiceContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  choiceTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  choiceSubtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: Spacing.lg,
  },
  choiceButtons: {
    width: '100%',
    gap: Spacing.md,
  },
  choiceButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  choiceButtonIcon: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  choiceButtonName: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  choiceButtonDesc: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  skipButton: {
    marginTop: Spacing.lg,
    padding: Spacing.sm,
  },
  skipText: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.5)',
    textDecorationLine: 'underline',
  },
});
