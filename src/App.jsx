import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, Platform, StatusBar, Animated } from 'react-native';
import { Text } from './components/AppText';
import { useFonts } from 'expo-font';
import { SairaStencilOne_400Regular } from '@expo-google-fonts/saira-stencil-one';

import GoalInput from './components/GoalInput';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import CheckpointCelebration from './components/CheckpointCelebration';
import LevelRoastModal from './components/LevelRoastModal';
import EndScreen from './components/EndScreen';

import { useStepTracker } from './hooks/useStepTracker';
import { useGoalManager } from './hooks/useGoalManager';

const SCREENS = {
  GOAL: 'goal',
  DASHBOARD: 'dashboard',
  MAP: 'map',
  END: 'end',
};

export default function App() {
  const [fontsLoaded] = useFonts({
    SairaStencilOne_400Regular,
  });

  const [screen, setScreen] = useState(SCREENS.GOAL);
  const [goal, setGoal] = useState(0);
  const [celebrating, setCelebrating] = useState(null);
  const [levelRoast, setLevelRoast] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const { steps, simulateWalk, resetSteps, addSteps } = useStepTracker();
  const { 
    milestones, checkMilestones, completeLevel, failLevel,
    resetMilestones, completedCount, totalMilestones,
    currentLevel, currentMilestone, allLevelsDone 
  } = useGoalManager(goal);

  useEffect(() => {
    if (screen !== SCREENS.DASHBOARD || celebrating) return;
    const newMilestone = checkMilestones(steps);
    if (newMilestone) {
      setCelebrating(newMilestone);
    }
  }, [steps, screen, checkMilestones, celebrating]);

  const navigateWithTransition = useCallback((nextScreen, middleAction) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setScreen(nextScreen);
      if (middleAction) middleAction();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnim]);

  const handleStart = useCallback((selectedGoal) => {
    navigateWithTransition(SCREENS.DASHBOARD, () => {
      setGoal(selectedGoal);
    });
  }, [navigateWithTransition]);

  const handleStartLevel = useCallback(() => {
    if (allLevelsDone || !currentMilestone) return;
    navigateWithTransition(SCREENS.MAP);
  }, [allLevelsDone, currentMilestone, navigateWithTransition]);

  const handleLevelDone = useCallback(() => {
    if (!currentMilestone) return;
    const levelIdx = currentLevel - 1;
    const stepsToAdd = currentMilestone.target - steps;
    
    if (stepsToAdd > 0) {
      simulateWalk(stepsToAdd);
    }
    completeLevel(levelIdx);
    
    navigateWithTransition(SCREENS.DASHBOARD, () => {
      setTimeout(() => {
        setCelebrating(currentMilestone);
      }, 100);
    });
  }, [currentMilestone, currentLevel, steps, simulateWalk, completeLevel, navigateWithTransition]);

  const handleEndLevel = useCallback(() => {
    if (!currentMilestone) return;
    const levelIdx = currentLevel - 1;
    const levelNum = currentLevel;
    failLevel(levelIdx);
    setLevelRoast({ milestone: currentMilestone, levelNumber: levelNum });
  }, [currentMilestone, currentLevel, failLevel]);

  const handleDismissLevelRoast = useCallback(() => {
    setLevelRoast(null);
    navigateWithTransition(SCREENS.DASHBOARD);
  }, [navigateWithTransition]);

  const handleEndDay = useCallback(() => {
    navigateWithTransition(SCREENS.END);
  }, [navigateWithTransition]);

  const handleRestart = useCallback(() => {
    navigateWithTransition(SCREENS.GOAL, () => {
      resetSteps();
      resetMilestones();
      setGoal(0);
      setCelebrating(null);
      setLevelRoast(null);
    });
  }, [resetSteps, resetMilestones, navigateWithTransition]);

  if (!fontsLoaded) {
    return (
      <View style={[styles.app, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff' }}>Loading textures...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {screen === SCREENS.GOAL && (
          <GoalInput onStart={handleStart} />
        )}

        {screen === SCREENS.DASHBOARD && (
          <Dashboard
            goal={goal}
            steps={steps}
            milestones={milestones}
            onStartLevel={handleStartLevel}
            onEndDay={handleEndDay}
            currentLevel={currentLevel}
            allLevelsDone={allLevelsDone}
          />
        )}

        {screen === SCREENS.MAP && currentMilestone && (
          <MapView
            milestone={currentMilestone}
            levelNumber={currentLevel}
            onDone={handleLevelDone}
            onEndLevel={handleEndLevel}
          />
        )}

        {screen === SCREENS.END && (
          <EndScreen
            isSuccess={steps >= goal}
            steps={steps}
            goal={goal}
            onRestart={handleRestart}
          />
        )}

        {/* Overlays */}
        {celebrating && (
          <View style={styles.overlay}>
            <CheckpointCelebration
              milestone={celebrating}
              onDismiss={() => setCelebrating(null)}
            />
          </View>
        )}

        {levelRoast && (
          <View style={styles.overlay}>
            <LevelRoastModal
              milestone={levelRoast.milestone}
              levelNumber={levelRoast.levelNumber}
              onDismiss={handleDismissLevelRoast}
            />
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#0a0a0c',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    elevation: 10,
    zIndex: 10,
  }
});
