/**
 * DESIGN LOCKED - Matches guardian-design/test-binaural-beats.html
 * Beautiful glassmorphism UI with mesh gradient background
 * Do not simplify or flatten this design
 */
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type BrainState = 'delta' | 'theta' | 'alpha' | 'beta' | 'schumann';

const BRAIN_STATES = [
  { id: 'delta' as BrainState, name: 'Delta', hz: '2 Hz', icon: '🌙', desc: 'Deep sleep & healing' },
  { id: 'theta' as BrainState, name: 'Theta', hz: '6 Hz', icon: '🧘', desc: 'Deep meditation' },
  { id: 'alpha' as BrainState, name: 'Alpha', hz: '10 Hz', icon: '🌊', desc: 'Relaxation & flow' },
  { id: 'beta' as BrainState, name: 'Beta', hz: '15 Hz', icon: '⚡', desc: 'Focus & concentration' },
];

const FOCUS_MODES = [
  { id: 'deep_work', name: 'Deep Work', shorthand: 'Alpha → Beta', time: '25 min', icon: '💻' },
  { id: 'study', name: 'Study / Memory', shorthand: 'Theta → Alpha', time: '45 min', icon: '📚' },
  { id: 'calm', name: 'Calm Nervous System', shorthand: 'Delta → Theta', time: '15 min', icon: '🌿' },
  { id: 'sleep', name: 'Sleep Induction', shorthand: 'Theta → Delta', time: '∞', icon: '😴' },
];

const LOCKED_TRACKS = [
  { id: 'deep', name: 'Deep Tranquility', desc: 'Ultra deep relaxation', icon: '🌙' },
  { id: 'inner', name: 'Inner Light Journey', desc: 'Positive affirmations', icon: '✨' },
];

export default function BinauralScreen() {
  const [selectedBrainState, setSelectedBrainState] = useState<BrainState>('delta');
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(15);
  const [totalDuration] = useState(600);
  const [waveformHeights] = useState(() =>
    Array.from({ length: 40 }, () => 20 + Math.random() * 60)
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (currentTime / totalDuration) * 100;
  const selectedState = BRAIN_STATES.find(s => s.id === selectedBrainState);

  return (
    <View style={styles.container}>
      {/* Mesh Gradient Background */}
      <LinearGradient
        colors={['#fce7f3', '#e9d5ff', '#fdf2f8']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Radial gradient overlays for mesh effect */}
      <View style={styles.gradientOverlay1} />
      <View style={styles.gradientOverlay2} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🎧</Text>
          <Text style={styles.headerTitle}>Binaural Beats</Text>
        </View>

        {/* Headphones Info Card - Glassmorphism */}
        <View style={styles.glassCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Text style={styles.infoIcon}>🎧</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Headphones required</Text>
              <Text style={styles.infoText}>
                Binaural beats work by delivering slightly different frequencies to each ear. Effect only occurs with stereo headphones — speakers won't produce it.
              </Text>
            </View>
          </View>
        </View>

        {/* Brain State Selection - Horizontal Pills */}
        <Text style={styles.sectionLabel}>Select Brain State:</Text>
        <View style={styles.brainStatesRow}>
          {BRAIN_STATES.map((state) => (
            <TouchableOpacity
              key={state.id}
              style={[
                styles.brainPill,
                selectedBrainState === state.id && styles.brainPillSelected,
              ]}
              onPress={() => setSelectedBrainState(state.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.brainPillIcon}>{state.icon}</Text>
              <Text style={[
                styles.brainPillName,
                selectedBrainState === state.id && styles.brainPillNameSelected,
              ]}>
                {state.name}
              </Text>
              <Text style={[
                styles.brainPillHz,
                selectedBrainState === state.id && styles.brainPillHzSelected,
              ]}>
                {state.hz}
              </Text>
              <Text style={[
                styles.brainPillDesc,
                selectedBrainState === state.id && styles.brainPillDescSelected,
              ]}>
                {state.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Focus Modes Grid */}
        <Text style={styles.sectionLabel}>Focus Modes:</Text>
        <View style={styles.focusModesGrid}>
          {FOCUS_MODES.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.focusModeCard,
                selectedMode === mode.id && styles.focusModeCardSelected,
              ]}
              onPress={() => setSelectedMode(mode.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.focusModeName}>{mode.name}</Text>
              <Text style={styles.focusModeShorthand}>{mode.shorthand}</Text>
              <View style={styles.focusModeFooter}>
                <Text style={styles.focusModeTime}>🔒 {mode.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Player Card - Glassmorphism */}
        <View style={styles.glassCard}>
          <View style={styles.playerHeader}>
            <View style={styles.trackInfo}>
              <View style={styles.trackIconContainer}>
                <Text style={styles.trackIcon}>{selectedState?.icon}</Text>
              </View>
              <View>
                <Text style={styles.trackTitle}>{selectedState?.name} · {selectedState?.hz}</Text>
                <Text style={styles.trackSubtitle}>Relaxing Hypnotic Music</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.playToggle, isPlaying && styles.playToggleActive]}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              <View style={[styles.toggleKnob, isPlaying && styles.toggleKnobActive]} />
            </TouchableOpacity>
          </View>

          {/* Waveform Visualization */}
          <View style={styles.waveformContainer}>
            {waveformHeights.map((height, i) => (
              <View
                key={i}
                style={[
                  styles.waveformBar,
                  { height: `${height}%` },
                  i / waveformHeights.length < progressPercentage / 100 && styles.waveformBarActive,
                ]}
              />
            ))}
          </View>

          {/* Scrubber */}
          <View style={styles.scrubberTrack}>
            <View style={[styles.scrubberProgress, { width: `${progressPercentage}%` }]} />
            <View style={[styles.scrubberBall, { left: `${progressPercentage}%` }]} />
          </View>

          {/* Timestamps */}
          <View style={styles.timestampRow}>
            <Text style={styles.timestamp}>{formatTime(currentTime)}</Text>
            <Text style={styles.timestamp}>-{formatTime(totalDuration - currentTime)}</Text>
          </View>

          <Text style={styles.playerNote}>Play binaural beats alongside this track</Text>

          {/* Compatibility Tags */}
          <View style={styles.tagsRow}>
            <Text style={styles.tagsLabel}>Compatible with</Text>
            {BRAIN_STATES.slice(0, 4).map((state) => (
              <View key={state.id} style={styles.tag}>
                <Text style={styles.tagIcon}>{state.icon}</Text>
                <Text style={styles.tagText}>{state.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Locked Tracks */}
        <View style={styles.glassCard}>
          {LOCKED_TRACKS.map((track, index) => (
            <View
              key={track.id}
              style={[
                styles.lockedTrackRow,
                index < LOCKED_TRACKS.length - 1 && styles.lockedTrackBorder,
              ]}
            >
              <View style={styles.lockedTrackIconContainer}>
                <Text style={styles.lockedTrackIcon}>{track.icon}</Text>
              </View>
              <View style={styles.lockedTrackInfo}>
                <Text style={styles.lockedTrackName}>{track.name}</Text>
                <Text style={styles.lockedTrackDesc}>{track.desc}</Text>
              </View>
              <Ionicons name="lock-closed" size={18} color="#9ca3af" />
            </View>
          ))}
        </View>

        {/* Spacer for bottom bar */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sleeping Cat Mascot */}
      <Image
        source={require('../../assets/sleeping-cat.png')}
        style={styles.catMascot}
        resizeMode="contain"
      />

      {/* Floating Now Playing Bar */}
      <View style={styles.nowPlayingBar}>
        <View style={styles.nowPlayingLeft}>
          <Text style={styles.nowPlayingLabel}>NOW PLAYING</Text>
          <TouchableOpacity
            style={styles.nowPlayingPill}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <View style={styles.pauseIcon}>
              <View style={styles.pauseBar} />
              <View style={styles.pauseBar} />
            </View>
            <Text style={styles.nowPlayingTrack}>{selectedState?.name} · {selectedState?.hz}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={20} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fce7f3',
  },
  gradientOverlay1: {
    position: 'absolute',
    top: '10%',
    left: '-20%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(251, 207, 232, 0.6)',
  },
  gradientOverlay2: {
    position: 'absolute',
    top: '5%',
    right: '-10%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(216, 180, 254, 0.5)',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#a591ff',
  },

  // Glassmorphism Card
  glassCard: {
    backgroundColor: 'rgba(243, 232, 255, 0.45)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    // Glassmorphism borders
    borderTopWidth: 1.2,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(255, 255, 255, 0.7)',
    borderLeftColor: 'rgba(255, 255, 255, 0.7)',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: 'rgba(76, 29, 149, 0.06)',
    borderRightColor: 'rgba(76, 29, 149, 0.06)',
    // Shadow
    shadowColor: '#4c1d95',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.08,
    shadowRadius: 35,
    elevation: 8,
  },

  // Info Card
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 18,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4c1d95',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#4c1d95',
    opacity: 0.7,
    lineHeight: 18,
  },

  // Section Label
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#4c1d95',
    opacity: 0.6,
    marginBottom: 12,
    marginTop: 8,
  },

  // Brain States - Horizontal Pills
  brainStatesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  brainPill: {
    flex: 1,
    backgroundColor: '#fff7ed',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    // Raised effect
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    borderLeftColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1.2,
    borderRightWidth: 1.2,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
    borderRightColor: 'rgba(0, 0, 0, 0.04)',
    shadowColor: '#4c1d95',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  brainPillSelected: {
    backgroundColor: '#a591ff',
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    shadowColor: '#a591ff',
    shadowOpacity: 0.15,
    elevation: 4,
  },
  brainPillIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  brainPillName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4c1d95',
    textAlign: 'center',
  },
  brainPillNameSelected: {
    color: 'white',
  },
  brainPillHz: {
    fontSize: 9,
    fontWeight: '600',
    color: '#4c1d95',
    opacity: 0.7,
    marginTop: 2,
  },
  brainPillHzSelected: {
    color: 'white',
    opacity: 0.9,
  },
  brainPillDesc: {
    fontSize: 8,
    color: '#4c1d95',
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 2,
  },
  brainPillDescSelected: {
    color: 'white',
    opacity: 0.8,
  },

  // Focus Modes Grid
  focusModesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  focusModeCard: {
    width: (width - 52) / 2,
    maxWidth: 220,
    backgroundColor: 'rgba(243, 232, 255, 0.45)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#4c1d95',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 2,
  },
  focusModeCardSelected: {
    borderColor: '#a591ff',
    borderWidth: 1.5,
    backgroundColor: 'rgba(165, 145, 255, 0.08)',
  },
  focusModeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4c1d95',
    marginBottom: 4,
  },
  focusModeShorthand: {
    fontSize: 11,
    fontWeight: '600',
    color: '#a591ff',
    opacity: 0.9,
    marginBottom: 8,
  },
  focusModeFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  focusModeTime: {
    fontSize: 10,
    color: '#8b839a',
  },

  // Player Card
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trackIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(165, 145, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackIcon: {
    fontSize: 20,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4c1d95',
  },
  trackSubtitle: {
    fontSize: 11,
    color: '#4c1d95',
    opacity: 0.6,
    marginTop: 1,
  },
  playToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 29, 149, 0.1)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  playToggleActive: {
    backgroundColor: '#a591ff',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },

  // Waveform
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    gap: 2,
    marginBottom: 8,
  },
  waveformBar: {
    flex: 1,
    backgroundColor: 'rgba(253, 215, 170, 0.4)',
    borderRadius: 99,
    minHeight: 4,
  },
  waveformBarActive: {
    backgroundColor: '#a78bfa',
  },

  // Scrubber
  scrubberTrack: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 99,
    marginBottom: 6,
    position: 'relative',
  },
  scrubberProgress: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#a591ff',
    borderRadius: 99,
  },
  scrubberBall: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fed7aa',
    borderWidth: 1.5,
    borderColor: '#fcd34d',
    top: -5,
    marginLeft: -7,
    shadowColor: '#fb923c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },

  // Timestamps
  timestampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4c1d95',
    opacity: 0.5,
  },

  playerNote: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4c1d95',
    opacity: 0.8,
    marginBottom: 12,
  },

  // Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  tagsLabel: {
    fontSize: 10,
    color: '#8b839a',
    marginRight: 4,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  tagIcon: {
    fontSize: 10,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4c1d95',
  },

  // Locked Tracks
  lockedTrackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  lockedTrackBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  lockedTrackIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(165, 145, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lockedTrackIcon: {
    fontSize: 16,
  },
  lockedTrackInfo: {
    flex: 1,
  },
  lockedTrackName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a591ff',
  },
  lockedTrackDesc: {
    fontSize: 11,
    color: '#8b839a',
    marginTop: 1,
  },

  // Cat Mascot
  catMascot: {
    position: 'absolute',
    right: 0,
    bottom: 80,
    width: 180,
    height: 180,
    opacity: 0.9,
  },

  // Now Playing Bar
  nowPlayingBar: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    height: 56,
    backgroundColor: 'rgba(76, 29, 149, 0.15)',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    // Glassmorphism
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 10,
  },
  nowPlayingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nowPlayingLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(76, 29, 149, 0.6)',
    letterSpacing: 0.5,
  },
  nowPlayingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.85)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 2,
  },
  pauseBar: {
    width: 2,
    height: 10,
    backgroundColor: 'white',
    borderRadius: 1,
  },
  nowPlayingTrack: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
  settingsButton: {
    padding: 4,
  },
});
