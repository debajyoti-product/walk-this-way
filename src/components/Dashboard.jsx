import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { Text } from './AppText';
import MiniGoalCard from './MiniGoalCard';
import FeedbackModal from './FeedbackModal';

const { width } = Dimensions.get('window');

export default function Dashboard({ 
  goal, 
  steps, 
  milestones, 
  onStartLevel, 
  onEndDay,
  currentLevel,
  allLevelsDone 
}) {
  const [showFeedback, setShowFeedback] = useState(false);
  const progressPercent = Math.min(100, (steps / goal) * 100);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🚶‍♂️</Text>
          <Text style={styles.headerTitle}>QUEST LOG</Text>
        </View>

        {/* Progress Display (Simplified from Ring) */}
        <View style={styles.progressWrap}>
          <View style={styles.progressCenter}>
            <Text style={styles.steps}>{steps.toLocaleString()}</Text>
            <Text style={styles.goalLabel}>/ {goal.toLocaleString()} steps</Text>
            <Text style={styles.percent}>{Math.floor(progressPercent)}%</Text>
          </View>
        </View>

        {/* Mini-goal cards */}
        <View style={styles.milestones}>
          <Text style={styles.sectionTitle}>VILLAINS</Text>
          <View style={styles.milestoneList}>
            {milestones.map((m, i) => (
              <MiniGoalCard 
                key={m.id} 
                milestone={m} 
                currentSteps={steps}
                index={i}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action buttons — sticky bottom */}
      <View style={styles.actions}>
        <View style={styles.actionsRow}>
          <Pressable 
            style={[styles.btn, styles.btnWalk, allLevelsDone && styles.btnDisabled]}
            onPress={onStartLevel}
            disabled={allLevelsDone}
          >
            <Text style={styles.btnTextIcon}>⚔️</Text>
            <Text style={[styles.btnTextWalk, allLevelsDone && styles.btnTextDisabled]}>
              {allLevelsDone ? 'ALL CLEARED' : `START LVL ${currentLevel}`}
            </Text>
          </Pressable>
          
          <Pressable 
            style={[styles.btn, styles.btnEnd]}
            onPress={onEndDay}
          >
            <Text style={styles.btnTextEnd}>🏁 End Day</Text>
          </Pressable>
        </View>

        <Pressable 
          style={[styles.btn, styles.btnFeedback]}
          onPress={() => setShowFeedback(true)}
        >
          <Text style={styles.btnTextFeedback}>💬 Share Feedback</Text>
        </Pressable>
      </View>

      {/* Feedback modal */}
      {showFeedback && (
        <FeedbackModal onClose={() => setShowFeedback(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 24,
    paddingBottom: 150, // Space for sticky actions
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    color: '#00fa9a',
    },
  progressWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#111',
    borderRadius: 160,
    width: 260,
    height: 260,
    alignSelf: 'center',
    marginBottom: 40,
    borderWidth: 8,
    borderColor: '#222',
  },
  progressCenter: {
    alignItems: 'center',
  },
  steps: {
    fontSize: 48,
    color: '#00fa9a',
    },
  goalLabel: {
    color: '#888',
    fontSize: 16,
    marginTop: 4,
  },
  percent: {
    fontSize: 20,
    color: '#00fa9a',
    marginTop: 8,
    },
  milestones: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#ff6b9d',
    marginBottom: 20,
  },
  milestoneList: {
    gap: 16,
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  btn: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: 56,
  },
  btnWalk: {
    backgroundColor: '#00fa9a',
    flex: 2,
  },
  btnEnd: {
    backgroundColor: '#333',
    flex: 1,
  },
  btnFeedback: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#444',
  },
  btnDisabled: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  btnTextIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  btnTextWalk: {
    color: '#000',
    fontSize: 16,
    },
  btnTextDisabled: {
    color: '#888',
  },
  btnTextEnd: {
    color: '#fff',
    fontSize: 16,
    },
  btnTextFeedback: {
    color: '#aaa',
    fontSize: 16,
  },
});
