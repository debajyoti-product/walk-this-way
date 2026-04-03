import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { Text } from './AppText';
import { getRandomItem } from '../utils/memes';

const levelRoasts = [
  "Aw, did the villain scare your legs off? 😱",
  "Your sneakers are filing for divorce. They feel neglected.",
  "Level abandoned! Even the GPS is confused. 🗺️",
  "Retreat accepted. Your couch sends its regards. 🛋️",
  "You didn't lose... you just strategically retreated. Very brave.",
  "The villain wins this round. But plot twist — there's always next time.",
  "Steps count: brave attempt. Completion: ...pending. 📋",
  "Even Mario takes a hit sometimes. You got this next time! 🍄",
];

export default function LevelRoastModal({ milestone, levelNumber, onDismiss }) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [caption] = useState(() => getRandomItem(levelRoasts));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        <Text style={styles.emoji}>💀</Text>
        
        <Text style={styles.header}>
          LEVEL {levelNumber} FAILED
        </Text>

        <Text style={styles.villain}>
          <Text style={styles.villainEmoji}>{milestone.emoji} </Text>
          {milestone.name} wins!
        </Text>
        
        <Text style={styles.message}>{caption}</Text>

        <Text style={styles.status}>
          MARKED INCOMPLETE
        </Text>

        <Pressable style={styles.btn} onPress={handleDismiss}>
          <Text style={styles.btnText}>BACK TO QUEST 🎮</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 100,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  header: {
    color: '#ff6b9d',
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 1,
  },
  villain: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  villainEmoji: {
    fontSize: 24,
  },
  message: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  status: {
    color: '#ff6b9d',
    fontSize: 14,
    marginBottom: 24,
    letterSpacing: 2,
  },
  btn: {
    backgroundColor: '#ff6b9d',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  btnText: {
    color: '#000',
    fontSize: 16,
    },
});
