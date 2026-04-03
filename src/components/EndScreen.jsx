import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { Text } from './AppText';
import { successCaptions, roastCaptions, getRandomItem } from '../utils/memes';

export default function EndScreen({ isSuccess, steps, goal, onRestart }) {
  const [fadeAnim] = useState(new Animated.Value(0));

  const caption = useMemo(
    () => getRandomItem(isSuccess ? successCaptions : roastCaptions),
    [isSuccess]
  );

  const percent = Math.floor((steps / goal) * 100);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <View style={styles.emojiWrap}>
          <Text style={styles.emoji}>{isSuccess ? '🏆' : '😴'}</Text>
        </View>

        <Text style={[styles.result, { color: isSuccess ? '#00ff88' : '#ff6b9d' }]}>
          {isSuccess ? 'QUEST COMPLETE!' : 'GAME OVER'}
        </Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{steps.toLocaleString()}</Text>
            <Text style={styles.statLabel}>STEPS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{percent}%</Text>
            <Text style={styles.statLabel}>COMPLETE</Text>
          </View>
        </View>

        <View style={styles.memeCard}>
          <Text style={styles.memeIcon}>{isSuccess ? '😎' : '🦥'}</Text>
          <Text style={styles.caption}>{caption}</Text>
        </View>

        {isSuccess && (
          <Text style={styles.score}>
            FINAL SCORE: {(steps * 10).toLocaleString()} PTS
          </Text>
        )}

        <Pressable
          style={[styles.cta, { backgroundColor: isSuccess ? '#00ff88' : '#ff6b9d' }]}
          onPress={onRestart}
        >
          <Text style={styles.ctaText}>
            {isSuccess ? 'NEW QUEST' : 'TRY AGAIN'}
          </Text>
          <Text style={styles.ctaIcon}>{isSuccess ? '🎮' : '💪'}</Text>
        </Pressable>

        <Text style={styles.sub}>
          {isSuccess
            ? "Your legs are officially legendary."
            : "Tomorrow's a new day. Your couch isn't going anywhere."}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  emojiWrap: {
    marginBottom: 20,
  },
  emoji: {
    fontSize: 80,
  },
  result: {
    fontSize: 32,
    marginBottom: 30,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    width: '100%',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    color: '#fff',
    },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 1,
  },
  statDivider: {
    width: 2,
    height: 40,
    backgroundColor: '#333',
  },
  memeCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  memeIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  caption: {
    color: '#ccc',
    fontSize: 14,
    flex: 1,
  },
  score: {
    fontSize: 20,
    color: '#ffd93d',
    marginBottom: 30,
    textAlign: 'center',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    marginBottom: 20,
  },
  ctaText: {
    color: '#000',
    fontSize: 18,
    marginRight: 8,
  },
  ctaIcon: {
    fontSize: 20,
  },
  sub: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
