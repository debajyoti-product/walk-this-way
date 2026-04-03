import { useState, useEffect, useCallback, useRef } from 'react';
import { getDistance } from './useWalkingRoute';

const PROXIMITY_THRESHOLD_METERS = 30;

export function useCheckpointTracker(checkpoints, currentLocation) {
  const [trackedCheckpoints, setTrackedCheckpoints] = useState([]);
  const [latestReached, setLatestReached] = useState(null);
  const reachedSetRef = useRef(new Set());

  // Reset tracked checkpoints when new checkpoints arrive
  useEffect(() => {
    if (checkpoints && checkpoints.length > 0) {
      setTrackedCheckpoints(checkpoints.map(cp => ({ ...cp, reached: false })));
      reachedSetRef.current = new Set();
      setLatestReached(null);
    }
  }, [checkpoints]);

  // Check proximity on every location update
  useEffect(() => {
    if (!currentLocation || trackedCheckpoints.length === 0) return;

    let updated = false;
    const newCheckpoints = trackedCheckpoints.map(cp => {
      if (cp.reached || reachedSetRef.current.has(cp.index)) return cp;

      const dist = getDistance(
        currentLocation.latitude, currentLocation.longitude,
        cp.latitude, cp.longitude
      );

      if (dist < PROXIMITY_THRESHOLD_METERS) {
        reachedSetRef.current.add(cp.index);
        updated = true;
        setLatestReached({ ...cp, reached: true });
        return { ...cp, reached: true };
      }
      return cp;
    });

    if (updated) {
      setTrackedCheckpoints(newCheckpoints);
    }
  }, [currentLocation, trackedCheckpoints]);

  const reachedCount = trackedCheckpoints.filter(cp => cp.reached).length;
  const totalCount = trackedCheckpoints.length;

  const dismissCelebration = useCallback(() => {
    setLatestReached(null);
  }, []);

  return {
    trackedCheckpoints,
    latestReached,
    reachedCount,
    totalCount,
    dismissCelebration,
  };
}
