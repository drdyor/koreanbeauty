// RoundtableView - Main container for Deep Dive Investigation mode
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Conditionally import Video for native platforms
let Video: any = null;
let ResizeMode: any = null;
if (Platform.OS !== 'web') {
  try {
    const av = require('expo-av');
    Video = av.Video;
    ResizeMode = av.ResizeMode;
  } catch (e) {
    console.log('expo-av not available');
  }
}
import {
  RoundtableSession,
  Exchange,
  ThreadId,
  THREAD_COLORS,
  HAMSTER_THREAD_MAP,
} from '../../types';
import { HamsterId, HAMSTER_CONFIG } from '../../config/hamsters.config';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants';
import {
  createNewSession,
  generateOpeningGambit,
  processAnswer,
  generateFollowUp,
  generateCouncilDebate,
  checkForSulking,
  generateHypotheses,
  calculateThreadProfile,
  shouldAdvanceRound,
  advanceRound,
  saveRoundtableSession,
  OpeningProbes,
} from '../../services/roundtableService';
import ProbeCard from './ProbeCard';
import CouncilDebate from './CouncilDebate';
import HypothesesView from './HypothesesView';

interface RoundtableViewProps {
  problem: string;
  existingSession?: RoundtableSession | null;
  onClose: () => void;
  onComplete: (session: RoundtableSession) => void;
}

type ViewState = 'permission' | 'loading' | 'probes' | 'answering' | 'debate' | 'hypotheses';

export default function RoundtableView({
  problem,
  existingSession,
  onClose,
  onComplete,
}: RoundtableViewProps) {
  const [session, setSession] = useState<RoundtableSession | null>(existingSession || null);
  const [viewState, setViewState] = useState<ViewState>('permission');
  const [openingProbes, setOpeningProbes] = useState<OpeningProbes | null>(null);
  const [currentExchanges, setCurrentExchanges] = useState<Exchange[]>([]);
  const [selectedHamster, setSelectedHamster] = useState<HamsterId | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Animation for entrance
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Initialize or resume session
  useEffect(() => {
    if (existingSession) {
      setSession(existingSession);
      // Determine view state based on session state
      if (existingSession.isComplete) {
        setViewState('hypotheses');
      } else if (existingSession.round === 4) {
        setViewState('hypotheses');
      } else if (existingSession.round === 3 && existingSession.debateInProgress) {
        setViewState('debate');
      } else {
        setViewState('probes');
      }
    }
  }, [existingSession]);

  // Start a new deep dive session
  const handleStartDeepDive = useCallback(async () => {
    setIsLoading(true);
    setShowVideo(true);
    setViewState('loading');

    try {
      const newSession = createNewSession(problem);
      setSession(newSession);

      // Generate opening probes
      const probes = await generateOpeningGambit(newSession);
      setOpeningProbes(probes);

      // Create exchanges for the probes
      const probeExchanges: Exchange[] = probes.probes.map((p, i) => ({
        id: `probe_${Date.now()}_${i}`,
        round: 1,
        hamsterId: p.hamsterId,
        type: 'probe' as const,
        content: p.question,
        userAnswer: null,
        timestamp: probes.timestamp,
      }));

      setCurrentExchanges(probeExchanges);

      const updatedSession = {
        ...newSession,
        exchanges: probeExchanges,
      };
      setSession(updatedSession);
      await saveRoundtableSession(updatedSession);

      setViewState('probes');
    } catch (error) {
      console.error('[RoundtableView] Failed to start:', error);
    } finally {
      setIsLoading(false);
      setShowVideo(false);
    }
  }, [problem]);

  // Handle when user selects a hamster to answer
  const handleSelectHamster = useCallback((hamsterId: HamsterId) => {
    setSelectedHamster(hamsterId);
    setViewState('answering');
  }, []);

  // Handle user's answer submission
  const handleSubmitAnswer = useCallback(async (answer: string) => {
    if (!session || !selectedHamster) return;

    setIsLoading(true);
    setShowVideo(true);

    try {
      // Process the answer
      const { activatedThreads, updatedSession } = processAnswer(
        session,
        selectedHamster,
        answer
      );

      // Check for sulking
      const sulkingExchanges = checkForSulking(updatedSession);

      // Generate follow-up if in round 2
      let followUpExchanges: Exchange[] = [];
      if (updatedSession.round >= 2) {
        followUpExchanges = await generateFollowUp(updatedSession, selectedHamster);
      }

      // Check if we should advance round
      let finalSession = updatedSession;
      if (shouldAdvanceRound(updatedSession)) {
        finalSession = advanceRound(updatedSession);
      }

      // Add sulking and follow-up exchanges
      finalSession = {
        ...finalSession,
        exchanges: [...finalSession.exchanges, ...sulkingExchanges, ...followUpExchanges],
      };

      // Check if we should trigger debate (round 3)
      const activeThreadCount = Object.values(finalSession.threads).filter(t => t.active).length;
      if (finalSession.round === 3 && activeThreadCount >= 2 && !finalSession.debateInProgress) {
        finalSession = { ...finalSession, debateInProgress: true };
        const debateExchanges = await generateCouncilDebate(finalSession);
        finalSession = {
          ...finalSession,
          exchanges: [...finalSession.exchanges, ...debateExchanges],
        };
        setViewState('debate');
      } else if (finalSession.round === 4) {
        // Generate hypotheses
        const hypotheses = await generateHypotheses(finalSession);
        const threadProfile = calculateThreadProfile(finalSession);
        finalSession = {
          ...finalSession,
          hypotheses,
          threadProfile,
        };
        setViewState('hypotheses');
      } else {
        setViewState('probes');
      }

      setSession(finalSession);
      setCurrentExchanges(finalSession.exchanges.filter(e => e.round === finalSession.round));
      await saveRoundtableSession(finalSession);
    } catch (error) {
      console.error('[RoundtableView] Failed to process answer:', error);
    } finally {
      setIsLoading(false);
      setShowVideo(false);
      setSelectedHamster(null);
    }
  }, [session, selectedHamster]);

  // Handle debate conclusion
  const handleDebateConcern = useCallback(async (threadId: ThreadId) => {
    if (!session) return;

    setIsLoading(true);

    try {
      // Boost the selected thread
      const updatedThreads = { ...session.threads };
      updatedThreads[threadId] = {
        ...updatedThreads[threadId],
        depth: updatedThreads[threadId].depth + 1,
      };

      let finalSession: RoundtableSession = {
        ...session,
        threads: updatedThreads,
        debateInProgress: false,
        round: 4,
      };

      // Generate hypotheses
      const hypotheses = await generateHypotheses(finalSession);
      const threadProfile = calculateThreadProfile(finalSession);
      finalSession = {
        ...finalSession,
        hypotheses,
        threadProfile,
      };

      setSession(finalSession);
      await saveRoundtableSession(finalSession);
      setViewState('hypotheses');
    } catch (error) {
      console.error('[RoundtableView] Failed to process debate:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Handle completion
  const handleComplete = useCallback(() => {
    if (!session) return;

    const completedSession: RoundtableSession = {
      ...session,
      isComplete: true,
      updatedAt: new Date().toISOString(),
    };

    saveRoundtableSession(completedSession);
    onComplete(completedSession);
  }, [session, onComplete]);

  // Handle save for later
  const handleSaveForLater = useCallback(() => {
    if (!session) return;

    const pausedSession: RoundtableSession = {
      ...session,
      isPaused: true,
      updatedAt: new Date().toISOString(),
    };

    saveRoundtableSession(pausedSession);
    onClose();
  }, [session, onClose]);

  // Render permission screen
  const renderPermission = () => (
    <View style={styles.permissionContainer}>
      <Text style={styles.permissionTitle}>Deep Dive</Text>
      <Text style={styles.permissionSubtitle}>This isn't a quick answer.</Text>

      <View style={styles.permissionContent}>
        <Text style={styles.permissionDescription}>
          We're going to ask you 4 reflection questions - one from each hamster.
          Then we'll synthesize what you're really choosing and build a 90-day experiment.
        </Text>

        <View style={styles.roundPreview}>
          <RoundIndicator round={1} label="Opening Gambit" active />
          <RoundIndicator round={2} label="Follow-Up" />
          <RoundIndicator round={3} label="Council Debate" />
          <RoundIndicator round={4} label="Hypotheses" />
        </View>
      </View>

      <View style={styles.permissionButtons}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartDeepDive}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Start Deep Dive</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Not now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render loading with hamster wheel video (or spinner on web)
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      {showVideo && Video && Platform.OS !== 'web' ? (
        <View style={styles.videoContainer}>
          <Video
            source={require('../../assets/hamster-wheel.mp4')}
            style={styles.video}
            resizeMode={ResizeMode?.CONTAIN}
            shouldPlay
            isLooping
            isMuted
          />
          <Text style={styles.loadingText}>Hamsters are thinking...</Text>
        </View>
      ) : (
        <View style={styles.spinnerContainer}>
          <View style={styles.hamsterSpinner}>
            <Text style={styles.spinnerEmoji}>🐹</Text>
          </View>
          <ActivityIndicator size="large" color={Colors.primary.purple} style={styles.spinner} />
          <Text style={styles.loadingText}>Hamsters are thinking...</Text>
        </View>
      )}
    </View>
  );

  // Render probe cards
  const renderProbes = () => {
    if (!session) return null;

    const probeExchanges = currentExchanges.filter(
      e => (e.type === 'probe' || e.type === 'follow_up' || e.type === 'interrupt' || e.type === 'sulk')
        && !e.userAnswer
    );

    return (
      <ScrollView style={styles.probesContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.roundHeader}>
          <Text style={styles.roundTitle}>Round {session.round} of 4</Text>
          <Text style={styles.roundSubtitle}>
            {session.round === 1 && 'Pick a hamster to answer'}
            {session.round === 2 && 'Go deeper with your chosen threads'}
            {session.round === 3 && 'The council is getting heated'}
          </Text>
        </View>

        {/* Thread Progress */}
        <View style={styles.threadProgress}>
          {(Object.entries(session.threads) as [ThreadId, typeof session.threads.pragmatic][]).map(
            ([threadId, thread]) => (
              <ThreadIndicator
                key={threadId}
                threadId={threadId}
                active={thread.active}
                depth={thread.depth}
              />
            )
          )}
        </View>

        {/* Probe Cards */}
        <View style={styles.probeCards}>
          {probeExchanges.map((exchange) => (
            <ProbeCard
              key={exchange.id}
              exchange={exchange}
              onSelect={() => handleSelectHamster(exchange.hamsterId)}
              isSelected={selectedHamster === exchange.hamsterId}
              isSulking={exchange.type === 'sulk'}
            />
          ))}
        </View>

        {/* Save for later */}
        <TouchableOpacity style={styles.saveForLater} onPress={handleSaveForLater}>
          <Ionicons name="bookmark-outline" size={16} color={Colors.text.muted} />
          <Text style={styles.saveForLaterText}>Save and continue later</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  // Render answering UI
  const renderAnswering = () => {
    if (!selectedHamster) return null;

    const exchange = currentExchanges.find(
      e => e.hamsterId === selectedHamster && !e.userAnswer
    );
    if (!exchange) return null;

    return (
      <AnswerInput
        exchange={exchange}
        onSubmit={handleSubmitAnswer}
        onCancel={() => {
          setSelectedHamster(null);
          setViewState('probes');
        }}
      />
    );
  };

  // Render debate
  const renderDebate = () => {
    if (!session) return null;

    const debateExchanges = session.exchanges.filter(e => e.type === 'debate');

    return (
      <CouncilDebate
        exchanges={debateExchanges}
        onSelectConcern={handleDebateConcern}
        isLoading={isLoading}
      />
    );
  };

  // Render hypotheses
  const renderHypotheses = () => {
    if (!session || !session.hypotheses || !session.threadProfile) return null;

    return (
      <HypothesesView
        hypotheses={session.hypotheses}
        threadProfile={session.threadProfile}
        onComplete={handleComplete}
        onSaveForLater={handleSaveForLater}
      />
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deep Dive</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Problem display */}
      <View style={styles.problemContainer}>
        <Text style={styles.problemLabel}>Your decision:</Text>
        <Text style={styles.problemText} numberOfLines={2}>
          {problem}
        </Text>
      </View>

      {/* Main content based on state */}
      {viewState === 'permission' && renderPermission()}
      {viewState === 'loading' && renderLoading()}
      {viewState === 'probes' && renderProbes()}
      {viewState === 'answering' && renderAnswering()}
      {viewState === 'debate' && renderDebate()}
      {viewState === 'hypotheses' && renderHypotheses()}

      {/* Loading overlay */}
      {isLoading && viewState !== 'loading' && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary.purple} />
        </View>
      )}
    </Animated.View>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function RoundIndicator({ round, label, active }: { round: number; label: string; active?: boolean }) {
  return (
    <View style={[styles.roundIndicator, active && styles.roundIndicatorActive]}>
      <View style={[styles.roundDot, active && styles.roundDotActive]}>
        <Text style={[styles.roundNumber, active && styles.roundNumberActive]}>{round}</Text>
      </View>
      <Text style={[styles.roundLabel, active && styles.roundLabelActive]}>{label}</Text>
    </View>
  );
}

function ThreadIndicator({
  threadId,
  active,
  depth,
}: {
  threadId: ThreadId;
  active: boolean;
  depth: number;
}) {
  const hamster = HAMSTER_CONFIG[
    threadId === 'pragmatic' ? 4 :
    threadId === 'psychological' ? 2 :
    threadId === 'analytical' ? 3 : 1
  ];

  return (
    <View style={styles.threadIndicator}>
      <View
        style={[
          styles.threadDot,
          { backgroundColor: active ? THREAD_COLORS[threadId] : Colors.neutral[300] },
        ]}
      >
        <Text style={styles.threadIcon}>{hamster.icon}</Text>
      </View>
      <View style={styles.threadDepthBar}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.depthSegment,
              {
                backgroundColor: i < depth ? THREAD_COLORS[threadId] : Colors.neutral[200],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function AnswerInput({
  exchange,
  onSubmit,
  onCancel,
}: {
  exchange: Exchange;
  onSubmit: (answer: string) => void;
  onCancel: () => void;
}) {
  const [answer, setAnswer] = useState('');
  const hamster = HAMSTER_CONFIG[exchange.hamsterId];

  return (
    <View style={styles.answerContainer}>
      <View style={styles.answerHeader}>
        <View style={[styles.answerHamsterBadge, { backgroundColor: hamster.color }]}>
          <Text style={styles.answerHamsterIcon}>{hamster.icon}</Text>
          <Text style={styles.answerHamsterName}>{hamster.defaultName}</Text>
        </View>
      </View>

      <Text style={styles.answerQuestion}>{exchange.content}</Text>

      <View style={styles.answerInputContainer}>
        <TextInput
          style={styles.answerInput}
          placeholder="Your answer..."
          value={answer}
          onChangeText={setAnswer}
          multiline
          textAlignVertical="top"
          autoFocus
        />
      </View>

      <View style={styles.answerButtons}>
        <TouchableOpacity style={styles.cancelAnswerButton} onPress={onCancel}>
          <Text style={styles.cancelAnswerText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitAnswerButton, !answer.trim() && styles.submitDisabled]}
          onPress={() => answer.trim() && onSubmit(answer)}
          disabled={!answer.trim()}
        >
          <Text style={styles.submitAnswerText}>Submit</Text>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Import TextInput
import { TextInput } from 'react-native';

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e', // Dark background for gravity
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: 'white',
  },
  placeholder: {
    width: 32,
  },
  problemContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  problemLabel: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  problemText: {
    fontSize: FontSizes.base,
    color: 'rgba(255,255,255,0.9)',
    fontStyle: 'italic',
  },

  // Permission screen
  permissionContainer: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: FontSizes['3xl'],
    fontWeight: 'bold',
    color: 'white',
    marginBottom: Spacing.sm,
  },
  permissionSubtitle: {
    fontSize: FontSizes.lg,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: Spacing.xl,
  },
  permissionContent: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    width: '100%',
  },
  permissionDescription: {
    fontSize: FontSizes.base,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  roundPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roundIndicator: {
    alignItems: 'center',
    flex: 1,
  },
  roundIndicatorActive: {},
  roundDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  roundDotActive: {
    backgroundColor: Colors.primary.purple,
    borderColor: Colors.primary.lavender,
    shadowColor: Colors.primary.purple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  roundNumber: {
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.5)',
  },
  roundNumberActive: {
    color: 'white',
  },
  roundLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  roundLabelActive: {
    color: 'white',
  },
  permissionButtons: {
    width: '100%',
    gap: Spacing.md,
  },
  startButton: {
    backgroundColor: Colors.primary.purple,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: 'white',
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FontSizes.base,
    color: 'rgba(255,255,255,0.6)',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  video: {
    width: 240,
    height: 240,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.base,
    color: 'rgba(255,255,255,0.7)',
  },
  spinnerContainer: {
    alignItems: 'center',
  },
  hamsterSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(168,85,247,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  spinnerEmoji: {
    fontSize: 40,
  },
  spinner: {
    marginBottom: Spacing.sm,
  },

  // Probes
  probesContainer: {
    flex: 1,
    padding: Spacing.lg,
  },
  roundHeader: {
    marginBottom: Spacing.lg,
  },
  roundTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  roundSubtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  threadProgress: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.md,
  },
  threadIndicator: {
    alignItems: 'center',
  },
  threadDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  threadIcon: {
    fontSize: 16,
  },
  threadDepthBar: {
    flexDirection: 'row',
    gap: 2,
  },
  depthSegment: {
    width: 6,
    height: 4,
    borderRadius: 2,
  },
  probeCards: {
    gap: Spacing.md,
  },
  saveForLater: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    marginTop: Spacing.md,
  },
  saveForLaterText: {
    marginLeft: Spacing.xs,
    fontSize: FontSizes.sm,
    color: Colors.text.muted,
  },

  // Answer input
  answerContainer: {
    flex: 1,
    padding: Spacing.lg,
  },
  answerHeader: {
    marginBottom: Spacing.md,
  },
  answerHamsterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  answerHamsterIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  answerHamsterName: {
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
    color: 'white',
  },
  answerQuestion: {
    fontSize: FontSizes.xl,
    color: 'white',
    lineHeight: 28,
    marginBottom: Spacing.lg,
  },
  answerInputContainer: {
    flex: 1,
    marginBottom: Spacing.lg,
  },
  answerInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.base,
    color: 'white',
    minHeight: 150,
  },
  answerButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelAnswerButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cancelAnswerText: {
    fontSize: FontSizes.base,
    color: 'rgba(255,255,255,0.7)',
  },
  submitAnswerButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary.purple,
    gap: Spacing.xs,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitAnswerText: {
    fontSize: FontSizes.base,
    fontWeight: 'bold',
    color: 'white',
  },

  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,26,46,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
