import { useState, useMemo, useRef, useCallback } from 'react';

const MILESTONE_NAMES = [
  { name: 'Darth Walker', emoji: '⚔️', flavor: 'The dark side of the footpath...' },
  { name: 'Green Stroller', emoji: '🧟', flavor: 'Slow, relentless, unstoppable.' },
  { name: 'Tread Giant', emoji: '🦶', flavor: 'Fee-fi-fo-fum, here come the steps!' },
  { name: 'Lord Crocomile', emoji: '🐊', flavor: 'Snapping at your heels!' },
  { name: 'Steppenstride', emoji: '👑', flavor: 'The final boss of all walkers.' },
];

export function useGoalManager(totalGoal) {
  const [completedIds, setCompletedIds] = useState(new Set());
  const [failedIds, setFailedIds] = useState(new Set());
  const lastCelebratedRef = useRef(-1);

  const milestones = useMemo(() => {
    if (!totalGoal || totalGoal <= 0) return [];
    const count = totalGoal >= 10000 ? 5 : totalGoal >= 5000 ? 4 : 3;
    const stepPer = Math.floor(totalGoal / count);
    
    return Array.from({ length: count }, (_, i) => {
      const template = MILESTONE_NAMES[i] || MILESTONE_NAMES[MILESTONE_NAMES.length - 1];
      return {
        id: i,
        name: template.name,
        emoji: template.emoji,
        flavor: template.flavor,
        target: i === count - 1 ? totalGoal : stepPer * (i + 1),
        isFinal: i === count - 1,
      };
    });
  }, [totalGoal]);

  // Current level = first milestone that is neither completed nor failed
  const currentLevel = useMemo(() => {
    for (let i = 0; i < milestones.length; i++) {
      if (!completedIds.has(i) && !failedIds.has(i)) {
        return i + 1; // 1-indexed
      }
    }
    return milestones.length + 1; // All done
  }, [milestones, completedIds, failedIds]);

  const currentMilestone = useMemo(() => {
    const idx = currentLevel - 1;
    return milestones[idx] || null;
  }, [milestones, currentLevel]);

  const allLevelsDone = currentLevel > milestones.length;

  // Complete a level (used when "Done" is clicked on the map)
  const completeLevel = useCallback((levelIndex) => {
    setCompletedIds(prev => new Set([...prev, levelIndex]));
    if (levelIndex > lastCelebratedRef.current) {
      lastCelebratedRef.current = levelIndex;
    }
  }, []);

  // Fail a level (used when "End Level" is clicked on the map)
  const failLevel = useCallback((levelIndex) => {
    setFailedIds(prev => new Set([...prev, levelIndex]));
  }, []);

  // Check milestones based on steps (keep for backward compat)
  const checkMilestones = useCallback((currentSteps) => {
    for (let i = 0; i < milestones.length; i++) {
      const milestone = milestones[i];
      if (currentSteps >= milestone.target && i > lastCelebratedRef.current) {
        lastCelebratedRef.current = i;
        setCompletedIds(prev => new Set([...prev, milestone.id]));
        return milestone;
      }
    }
    return null;
  }, [milestones]);

  const resetMilestones = useCallback(() => {
    setCompletedIds(new Set());
    setFailedIds(new Set());
    lastCelebratedRef.current = -1;
  }, []);

  const progress = useMemo(() => {
    if (!totalGoal) return [];
    return milestones.map(m => ({
      ...m,
      completed: completedIds.has(m.id),
      failed: failedIds.has(m.id),
    }));
  }, [milestones, completedIds, failedIds, totalGoal]);

  return {
    milestones: progress,
    checkMilestones,
    completeLevel,
    failLevel,
    resetMilestones,
    completedCount: completedIds.size,
    totalMilestones: milestones.length,
    currentLevel,
    currentMilestone,
    allLevelsDone,
  };
}
