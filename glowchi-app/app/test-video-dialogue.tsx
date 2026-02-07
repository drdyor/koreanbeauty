// Test screen for Video Dialogue - access via /test-video-dialogue
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import HamsterVideoDialogue from '../components/thinktank/HamsterVideoDialogue';
import { HamsterId } from '../config/hamsters.config';

// Sample dialogue data (simulating what we'd get from the API)
const SAMPLE_DIALOGUE = [
  {
    hamsterId: 1 as HamsterId,
    hamsterName: 'Al',
    action: 'twirling whiskers',
    content: "Let's start with who you're really doing this for. Is this about proving something to someone, or genuine growth?",
    timestamp: new Date().toISOString(),
  },
  {
    hamsterId: 4 as HamsterId,
    hamsterName: 'Rocky',
    action: 'spinning wheel',
    content: "Al's got a point, but let's get concrete. What's the FIRST thing you'd actually DO tomorrow morning if you decided yes?",
    timestamp: new Date().toISOString(),
  },
  {
    hamsterId: 2 as HamsterId,
    hamsterName: 'Erik',
    action: 'stroking whiskers',
    content: "Rocky's rushing it. This feels like a midlife pivot question. What chapter of your story is actually ending here?",
    timestamp: new Date().toISOString(),
  },
  {
    hamsterId: 3 as HamsterId,
    hamsterName: 'Cogni',
    action: 'adjusting glasses',
    content: "Hold on everyone. I'm hearing catastrophizing - 'too late' at 42? The average founder is 45. Let's examine that thought.",
    timestamp: new Date().toISOString(),
  },
  {
    hamsterId: 1 as HamsterId,
    hamsterName: 'Al',
    action: 'nodding',
    content: "Cogni's right about the data, but Erik's question matters too. Is this move about growth... or escape?",
    timestamp: new Date().toISOString(),
  },
  {
    hamsterId: 4 as HamsterId,
    hamsterName: 'Rocky',
    action: 'jumping down',
    content: "Fine - let's test both! 3-month experiment: 10 hours a week on the business while keeping the job. Family stays secure.",
    timestamp: new Date().toISOString(),
  },
];

export default function TestVideoDialogue() {
  const [videoSource, setVideoSource] = useState<'council-1' | 'council-2' | 'wheel'>('council-1');
  const [isComplete, setIsComplete] = useState(false);
  const [key, setKey] = useState(0); // For restarting

  const handleRestart = () => {
    setIsComplete(false);
    setKey(prev => prev + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Video selector */}
      <View style={styles.selector}>
        <Text style={styles.selectorLabel}>Video:</Text>
        {(['council-1', 'council-2', 'wheel'] as const).map((source) => (
          <TouchableOpacity
            key={source}
            style={[
              styles.selectorButton,
              videoSource === source && styles.selectorButtonActive,
            ]}
            onPress={() => {
              setVideoSource(source);
              handleRestart();
            }}
          >
            <Text style={styles.selectorButtonText}>{source}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Video Dialogue Component */}
      <HamsterVideoDialogue
        key={key}
        exchanges={SAMPLE_DIALOGUE}
        videoSource={videoSource}
        onDialogueComplete={() => setIsComplete(true)}
      />

      {/* Completion indicator */}
      {isComplete && (
        <View style={styles.completeContainer}>
          <Text style={styles.completeText}>✅ Dialogue Complete!</Text>
          <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
            <Text style={styles.restartText}>Restart</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 8,
  },
  selectorLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  selectorButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  selectorButtonActive: {
    backgroundColor: '#E74C3C',
  },
  selectorButtonText: {
    color: 'white',
    fontSize: 12,
  },
  completeContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(46, 204, 113, 0.9)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  restartButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  restartText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
