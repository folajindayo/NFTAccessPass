import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook for declarative interval management
 * @param callback - Function to call on each interval
 * @param delay - Delay in milliseconds (null to pause)
 */
export function useInterval(
  callback: () => void,
  delay: number | null
): void {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null) {
      return;
    }

    const tick = () => {
      savedCallback.current();
    };

    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}

/**
 * Hook for interval with immediate first call
 * @param callback - Function to call
 * @param delay - Delay in milliseconds (null to pause)
 * @param immediate - Whether to call immediately on mount
 */
export function useIntervalImmediate(
  callback: () => void,
  delay: number | null,
  immediate: boolean = true
): void {
  const savedCallback = useRef(callback);
  const hasRunRef = useRef(false);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (immediate && !hasRunRef.current) {
      savedCallback.current();
      hasRunRef.current = true;
    }
  }, [immediate]);

  useInterval(callback, delay);
}

/**
 * Hook for controllable interval
 */
export function useControllableInterval(
  callback: () => void,
  defaultDelay: number
): {
  start: (delay?: number) => void;
  stop: () => void;
  isRunning: boolean;
  reset: () => void;
} {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const isRunningRef = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      isRunningRef.current = false;
    }
  }, []);

  const start = useCallback((delay: number = defaultDelay) => {
    stop();
    intervalRef.current = setInterval(() => {
      callbackRef.current();
    }, delay);
    isRunningRef.current = true;
  }, [defaultDelay, stop]);

  const reset = useCallback(() => {
    stop();
    start();
  }, [start, stop]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return {
    start,
    stop,
    isRunning: isRunningRef.current,
    reset,
  };
}

/**
 * Hook for countdown timer
 */
export function useCountdown(
  targetDate: Date | number,
  interval: number = 1000
): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
} {
  const calculateTimeLeft = useCallback(() => {
    const target = typeof targetDate === 'number' ? targetDate : targetDate.getTime();
    const difference = target - Date.now();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isComplete: false,
    };
  }, [targetDate]);

  const timeLeftRef = useRef(calculateTimeLeft());

  useInterval(() => {
    timeLeftRef.current = calculateTimeLeft();
  }, interval);

  return timeLeftRef.current;
}

export default useInterval;

