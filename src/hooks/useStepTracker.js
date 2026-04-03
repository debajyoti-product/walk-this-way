import { useState, useCallback, useRef, useEffect } from 'react';

export function useStepTracker() {
  const [steps, setSteps] = useState(0);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const intervalRef = useRef(null);

  const addSteps = useCallback((count = 1) => {
    setSteps(prev => prev + count);
  }, []);

  const startAutoCount = useCallback((stepsPerSecond = 50) => {
    if (intervalRef.current) return;
    setIsAutoRunning(true);
    const interval = 1000 / stepsPerSecond;
    intervalRef.current = setInterval(() => {
      setSteps(prev => prev + 1);
    }, interval);
  }, []);

  const stopAutoCount = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsAutoRunning(false);
  }, []);

  const resetSteps = useCallback(() => {
    stopAutoCount();
    setSteps(0);
  }, [stopAutoCount]);

  // Auto-walk: adds steps in natural-feeling bursts
  const simulateWalk = useCallback((totalSteps = 500) => {
    let remaining = totalSteps;
    const burst = () => {
      if (remaining <= 0) return;
      const chunk = Math.min(remaining, Math.floor(Math.random() * 30) + 10);
      setSteps(prev => prev + chunk);
      remaining -= chunk;
      if (remaining > 0) {
        setTimeout(burst, Math.random() * 100 + 50);
      }
    };
    burst();
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    steps,
    addSteps,
    startAutoCount,
    stopAutoCount,
    resetSteps,
    simulateWalk,
    isAutoRunning,
  };
}
