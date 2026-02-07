// Think Tank - Hamster Council Tab
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants';
import { HamsterId, detectBigDecision } from '../../config/hamsters.config';
import { RoundtableSession } from '../../types';
import HamsterCouncilView from '../../components/thinktank/HamsterCouncilView';
import HamsterSession from '../../components/thinktank/HamsterSession';
import NibblesLog, { NibbleSession } from '../../components/thinktank/NibblesLog';
import CouncilResultView from '../../components/thinktank/CouncilResultView';
import RoundtableView from '../../components/thinktank/RoundtableView';
import { runHamsterCouncil, CouncilResult } from '../../services/hamsterService';
import { getActiveRoundtableSession, clearActiveSession } from '../../services/roundtableService';

type Screen = 'council' | 'session' | 'log' | 'consensus' | 'roundtable';

const STORAGE_KEY = 'thinktank:sessions';

export default function ThinkTankScreen() {
  const [screen, setScreen] = useState<Screen>('council');
  const [problem, setProblem] = useState('');
  const [selectedHamster, setSelectedHamster] = useState<HamsterId | null>(null);
  const [sessions, setSessions] = useState<NibbleSession[]>([]);
  const [councilResult, setCouncilResult] = useState<CouncilResult | null>(null);
  const [isCouncilLoading, setIsCouncilLoading] = useState(false);
  const [activeRoundtable, setActiveRoundtable] = useState<RoundtableSession | null>(null);
  const [isBigDecision, setIsBigDecision] = useState(false);

  // Load sessions and check for active roundtable on mount
  useEffect(() => {
    loadSessions();
    checkForActiveRoundtable();
  }, []);

  // Check if problem is a big decision (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (problem.trim().length > 50) {
        setIsBigDecision(detectBigDecision(problem));
      } else {
        setIsBigDecision(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [problem]);

  const checkForActiveRoundtable = async () => {
    try {
      const active = await getActiveRoundtableSession();
      if (active && !active.isComplete) {
        setActiveRoundtable(active);
      }
    } catch (error) {
      console.error('[ThinkTank] Failed to check active roundtable:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setSessions(JSON.parse(data));
      }
    } catch (error) {
      console.error('[ThinkTank] Failed to load sessions:', error);
    }
  };

  const saveSessions = async (newSessions: NibbleSession[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
      setSessions(newSessions);
    } catch (error) {
      console.error('[ThinkTank] Failed to save sessions:', error);
    }
  };

  const handleHamsterSelect = useCallback((id: HamsterId) => {
    setSelectedHamster(id);
    setScreen('session');
  }, []);

  const handleSessionComplete = useCallback(
    (result: {
      hamsterId: HamsterId;
      problem: string;
      toolResult: Record<string, string>;
      hamsterResponse: string;
    }) => {
      const newSession: NibbleSession = {
        id: Date.now().toString(),
        hamsterId: result.hamsterId,
        problem: result.problem,
        toolUsed:
          result.hamsterId === 1
            ? 'BelongingMap'
            : result.hamsterId === 2
            ? 'ChapterTitle'
            : result.hamsterId === 3
            ? 'ThoughtFlip'
            : 'TenMinuteCut',
        toolResult: result.toolResult,
        hamsterResponse: result.hamsterResponse,
        timestamp: new Date().toISOString(),
        nibblesEarned: 1,
      };

      const newSessions = [newSession, ...sessions];
      saveSessions(newSessions);
    },
    [sessions]
  );

  const handleBack = useCallback(() => {
    setScreen('council');
    setSelectedHamster(null);
  }, []);

  const handleShowLog = useCallback(() => {
    setScreen('log');
  }, []);

  const handleSwitchHamster = useCallback((id: HamsterId) => {
    setSelectedHamster(id);
    // Screen stays on 'session', just refreshes with new hamster
  }, []);

  const handleClearHistory = useCallback(() => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all session history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            saveSessions([]);
          },
        },
      ]
    );
  }, []);

  // Ask All Hamsters - triggers full council consensus
  const handleAskAllHamsters = useCallback(async () => {
    if (!problem.trim()) {
      Alert.alert('Enter a problem', 'Please describe your problem first.');
      return;
    }

    setScreen('consensus');
    setIsCouncilLoading(true);
    setCouncilResult(null);

    try {
      const result = await runHamsterCouncil(problem);
      setCouncilResult(result);

      // Award nibbles for using the full council
      const newSession: NibbleSession = {
        id: Date.now().toString(),
        hamsterId: result.chairmanId,
        problem: problem,
        toolUsed: 'CouncilConsensus',
        toolResult: { synthesis: result.stage3 },
        hamsterResponse: result.stage3,
        timestamp: result.timestamp,
        nibblesEarned: 4, // Bonus for using full council!
      };
      const newSessions = [newSession, ...sessions];
      saveSessions(newSessions);
    } catch (error) {
      console.error('[ThinkTank] Council error:', error);
      Alert.alert('Error', 'The council encountered an error. Please try again.');
      setScreen('council');
    } finally {
      setIsCouncilLoading(false);
    }
  }, [problem, sessions]);

  const handleCloseConsensus = useCallback(() => {
    setScreen('council');
    setCouncilResult(null);
    setProblem('');
  }, []);

  // Start Deep Dive Roundtable
  const handleStartDeepDive = useCallback(() => {
    if (!problem.trim()) {
      Alert.alert('Enter a problem', 'Please describe your problem first.');
      return;
    }
    setActiveRoundtable(null); // Start fresh
    setScreen('roundtable');
  }, [problem]);

  // Resume an existing roundtable
  const handleResumeDeepDive = useCallback(() => {
    if (activeRoundtable) {
      setScreen('roundtable');
    }
  }, [activeRoundtable]);

  // Roundtable completed
  const handleRoundtableComplete = useCallback((completedSession: RoundtableSession) => {
    // Award nibbles for completing deep dive
    const newSession: NibbleSession = {
      id: Date.now().toString(),
      hamsterId: 3, // Cogni as chairman
      problem: completedSession.problem,
      toolUsed: 'DeepDiveRoundtable',
      toolResult: {
        hypothesesCount: String(completedSession.hypotheses?.length || 0),
        dominantThread: completedSession.threadProfile?.dominant || 'unknown',
      },
      hamsterResponse: completedSession.threadProfile?.interpretation || 'Investigation complete',
      timestamp: new Date().toISOString(),
      nibblesEarned: 6, // Extra nibbles for deep dive!
    };

    const newSessions = [newSession, ...sessions];
    saveSessions(newSessions);

    setActiveRoundtable(null);
    clearActiveSession();
    setScreen('council');
    setProblem('');
  }, [sessions, saveSessions]);

  // Close roundtable without completing
  const handleCloseRoundtable = useCallback(() => {
    setScreen('council');
    // Active roundtable session is preserved for resume
    checkForActiveRoundtable();
  }, []);

  const totalNibbles = sessions.reduce((sum, s) => sum + s.nibblesEarned, 0);

  return (
    <LinearGradient colors={[...Colors.background.gradient]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      {screen === 'council' && (
        <HamsterCouncilView
          problem={problem}
          onProblemChange={setProblem}
          onHamsterSelect={handleHamsterSelect}
          onAskAllHamsters={handleAskAllHamsters}
          onShowNibblesLog={handleShowLog}
          nibblesCount={totalNibbles}
          isBigDecision={isBigDecision}
          onStartDeepDive={handleStartDeepDive}
          activeRoundtable={activeRoundtable}
          onResumeDeepDive={handleResumeDeepDive}
        />
      )}

      {screen === 'consensus' && (
        <CouncilResultView
          result={councilResult}
          isLoading={isCouncilLoading}
          problem={problem}
          onClose={handleCloseConsensus}
        />
      )}

      {screen === 'session' && selectedHamster && (
        <HamsterSession
          hamsterId={selectedHamster}
          problem={problem}
          onBack={handleBack}
          onComplete={handleSessionComplete}
          onSwitchHamster={handleSwitchHamster}
        />
      )}

      {screen === 'log' && (
        <NibblesLog
          sessions={sessions}
          onBack={handleBack}
          onClearHistory={handleClearHistory}
        />
      )}

      {screen === 'roundtable' && (
        <RoundtableView
          problem={problem}
          existingSession={activeRoundtable}
          onClose={handleCloseRoundtable}
          onComplete={handleRoundtableComplete}
        />
      )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60, // Safe area padding
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 100,
  },
});
