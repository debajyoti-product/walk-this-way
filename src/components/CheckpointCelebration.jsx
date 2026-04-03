import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { Text } from './AppText';
import { checkpointMessages, getRandomItem } from '../utils/memes';

export default function CheckpointCelebration({ milestone, onDismiss }) {
  const [message] = useState(() => getRandomItem(checkpointMessages));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => onDismiss());
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onDismiss]);

  if (!milestone) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Pressable 
        style={styles.backdrop} 
        onPress={() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => onDismiss());
        }}
      >
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.badge}>
            <Text style={styles.emoji}>{milestone.emoji}</Text>
          </View>
          
          <Text style={styles.level}>
            LEVEL CLEARED!
          </Text>
          
          <Text style={styles.name}>{milestone.name}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <Text style={styles.xp}>
            +{milestone.target.toLocaleString()} XP
          </Text>

          <Text style={styles.tap}>tap to continue</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    padding: 24,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
    elevation: 20,
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  badge: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#00ff88',
  },
  emoji: {
    fontSize: 40,
  },
  level: {
    color: '#00ff88',
    fontSize: 20,
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  name: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  xp: {
    color: '#ffd93d',
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  tap: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});
