// HamsterVideoDialogue - Shows hamster animation video with dialogue bubbles
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { HamsterId, HAMSTER_CONFIG } from '../../config/hamsters.config';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DialogueExchange {
  hamsterId: HamsterId;
  hamsterName: string;
  action: string;
  content: string;
  timestamp: string;
}

interface HamsterVideoDialogueProps {
  exchanges: DialogueExchange[];
  videoSource?: 'council-1' | 'council-2' | 'wheel';
  onDialogueComplete?: () => void;
  autoPlay?: boolean;
}

// Video assets mapping
const VIDEO_SOURCES = {
  'council-1': require('../../assets/hamster-council-1.mp4'),
  'council-2': require('../../assets/hamster-council-2.mp4'),
  'wheel': require('../../assets/hamster-wheel.mp4'),
};

export default function HamsterVideoDialogue({
  exchanges,
  videoSource = 'council-1',
  onDialogueComplete,
  autoPlay = true,
}: HamsterVideoDialogueProps) {
  const videoRef = useRef<Video>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [currentExchangeIndex, setCurrentExchangeIndex] = useState(0);
  const [visibleExchanges, setVisibleExchanges] = useState<DialogueExchange[]>([]);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  // Animate exchanges appearing one by one
  useEffect(() => {
    if (currentExchangeIndex < exchanges.length) {
      const timer = setTimeout(() => {
        setVisibleExchanges(prev => [...prev, exchanges[currentExchangeIndex]]);
        setCurrentExchangeIndex(prev => prev + 1);

        // Scroll to bottom
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 2500); // 2.5 seconds between each exchange

      return () => clearTimeout(timer);
    } else if (currentExchangeIndex === exchanges.length && exchanges.length > 0) {
      // All exchanges shown
      onDialogueComplete?.();
    }
  }, [currentExchangeIndex, exchanges]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.didJustFinish) {
      // Loop the video
      videoRef.current?.replayAsync();
    }
  };

  return (
    <View style={styles.container}>
      {/* Video Player */}
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={VIDEO_SOURCES[videoSource]}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay={isPlaying}
          isLooping
          isMuted={false}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />

        {/* Gradient overlay for text readability */}
        <View style={styles.videoOverlay} />

        {/* Council title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>🐹 The Council Deliberates</Text>
        </View>
      </View>

      {/* Dialogue Bubbles */}
      <ScrollView
        ref={scrollRef}
        style={styles.dialogueContainer}
        contentContainerStyle={styles.dialogueContent}
        showsVerticalScrollIndicator={false}
      >
        {visibleExchanges.map((exchange, index) => (
          <DialogueBubble
            key={`${exchange.hamsterId}-${index}`}
            exchange={exchange}
            index={index}
          />
        ))}

        {/* Typing indicator when more exchanges coming */}
        {currentExchangeIndex < exchanges.length && (
          <View style={styles.typingContainer}>
            <TypingIndicator />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Individual dialogue bubble
function DialogueBubble({ exchange, index }: { exchange: DialogueExchange; index: number }) {
  const hamster = HAMSTER_CONFIG[exchange.hamsterId];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          borderLeftColor: hamster.color,
        },
      ]}
    >
      {/* Hamster name and action */}
      <View style={styles.bubbleHeader}>
        <Text style={styles.hamsterIcon}>{hamster.icon}</Text>
        <Text style={[styles.hamsterName, { color: hamster.color }]}>
          {exchange.hamsterName}
        </Text>
        {exchange.action && (
          <Text style={styles.hamsterAction}>({exchange.action})</Text>
        )}
      </View>

      {/* Content */}
      <Text style={styles.bubbleContent}>{exchange.content}</Text>
    </Animated.View>
  );
}

// Typing indicator
function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={styles.typingDots}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            styles.typingDot,
            {
              opacity: dot.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
              transform: [
                {
                  scale: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.6, // 60% of width for video
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  titleContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  dialogueContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  dialogueContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  hamsterIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  hamsterName: {
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
  },
  hamsterAction: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  bubbleContent: {
    fontSize: FontSizes.base,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  typingContainer: {
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  typingDots: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
});
