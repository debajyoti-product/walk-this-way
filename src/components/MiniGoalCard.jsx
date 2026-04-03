import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './AppText';

export default function MiniGoalCard({ milestone, currentSteps, index }) {
  const { name, emoji, target, completed, failed, flavor } = milestone;
  const isActive = currentSteps < target && !completed && !failed && 
    (index === 0 || currentSteps >= 0);
  
  const progressInMilestone = completed 
    ? 100 
    : failed 
      ? 0
      : Math.min(100, Math.max(0, (currentSteps / target) * 100));

  return (
    <View style={[
      styles.card,
      completed && styles.cardCompleted,
      failed && styles.cardFailed,
      isActive && styles.cardActive
    ]}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>
          {completed ? '✅' : failed ? '❌' : emoji}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.targetWrap}>
          {completed ? (
            <Text style={styles.doneText}>CLEARED!</Text>
          ) : failed ? (
            <Text style={styles.failedText}>INCOMPLETE</Text>
          ) : (
            <Text style={styles.targetText}>{currentSteps.toLocaleString()} / {target.toLocaleString()}</Text>
          )}
        </View>

        {/* Progress bar */}
        <View style={styles.bar}>
          <View 
            style={[
              styles.barFill,
              failed && styles.barFillFailed,
              completed && styles.barFillCompleted,
              { width: `${progressInMilestone}%` }
            ]}
          />
        </View>
      </View>

      <View style={styles.levelWrap}>
        <Text style={styles.levelText}>LV{index + 1}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  cardCompleted: {
    backgroundColor: 'rgba(0, 250, 154, 0.1)',
    borderColor: 'rgba(0, 250, 154, 0.3)',
  },
  cardFailed: {
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
    borderColor: 'rgba(255, 107, 157, 0.3)',
    opacity: 0.7,
  },
  cardActive: {
    borderColor: '#00fa9a',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  targetWrap: {
    marginBottom: 8,
  },
  doneText: {
    color: '#00fa9a',
    fontSize: 12,
    },
  failedText: {
    color: '#ff6b9d',
    fontSize: 12,
    },
  targetText: {
    color: '#aaa',
    fontSize: 12,
  },
  bar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#00fa9a',
    borderRadius: 3,
  },
  barFillCompleted: {
    backgroundColor: '#00fa9a',
  },
  barFillFailed: {
    backgroundColor: '#ff6b9d',
  },
  levelWrap: {
    marginLeft: 16,
    backgroundColor: '#222',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelText: {
    color: '#00fa9a',
    fontSize: 12,
    },
});
