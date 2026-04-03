import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { Text } from './AppText';

const PRESETS = [
  { label: '5K', value: 5000, emoji: '🚶' },
  { label: '8K', value: 8000, emoji: '🏃' },
  { label: '10K', value: 10000, emoji: '⚡' },
  { label: '15K', value: 15000, emoji: '🔥' },
];

export default function GoalInput({ onStart }) {
  const [goal, setGoal] = useState(8000);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleStart = () => {
    if (goal >= 1000) {
      onStart(goal);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.logo}>🚶‍♂️</Text>
        <Text style={styles.title}>WALK THIS WAY</Text>
      </View>

      <Text style={styles.subtitle}>Set your daily step goal</Text>
      
      <View style={styles.display}>
        <Text style={styles.number}>{goal.toLocaleString()}</Text>
        <Text style={styles.label}>STEPS TODAY</Text>
      </View>

      <View style={styles.presets}>
        {PRESETS.map((p) => (
          <Pressable
            key={p.value}
            style={[styles.preset, goal === p.value && styles.presetActive]}
            onPress={() => setGoal(p.value)}
          >
            <Text style={styles.presetEmoji}>{p.emoji}</Text>
            <Text style={[styles.presetLabel, goal === p.value && styles.presetLabelActive]}>{p.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.cta} onPress={handleStart}>
        <Text style={styles.ctaText}>START QUEST ▶</Text>
      </Pressable>

      <Text style={styles.hint}>Powered by your actual legs (no cheat codes) 🎮</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    color: '#00fa9a',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  display: {
    alignItems: 'center',
    marginBottom: 40,
  },
  number: {
    fontSize: 64,
    color: '#00fa9a',
    },
  label: {
    color: '#888',
    fontSize: 14,
    letterSpacing: 2,
    marginTop: -5,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 60,
  },
  preset: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  presetActive: {
    borderColor: '#00fa9a',
    backgroundColor: 'rgba(0, 250, 154, 0.1)',
  },
  presetEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  presetLabel: {
    color: '#fff',
    },
  presetLabelActive: {
    color: '#00fa9a',
  },
  cta: {
    backgroundColor: '#00fa9a',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginBottom: 20,
  },
  ctaText: {
    color: '#000',
    fontSize: 18,
    },
  hint: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  }
});
