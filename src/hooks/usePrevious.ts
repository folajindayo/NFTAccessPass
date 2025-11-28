import { useRef, useEffect } from 'react';

/**
 * Hook to get the previous value of a state
 * @param value - The current value
 * @returns The previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Hook to track if a value has changed
 * @param value - The value to track
 * @returns [hasChanged, previousValue]
 */
export function useHasChanged<T>(value: T): [boolean, T | undefined] {
  const previous = usePrevious(value);
  const hasChanged = previous !== undefined && previous !== value;
  
  return [hasChanged, previous];
}

/**
 * Hook to get the previous and current value together
 */
export function usePreviousAndCurrent<T>(value: T): {
  current: T;
  previous: T | undefined;
  hasChanged: boolean;
} {
  const previous = usePrevious(value);
  
  return {
    current: value,
    previous,
    hasChanged: previous !== undefined && previous !== value,
  };
}

/**
 * Hook to track value history
 * @param value - The value to track
 * @param maxHistory - Maximum number of previous values to keep
 */
export function useValueHistory<T>(value: T, maxHistory: number = 10): T[] {
  const historyRef = useRef<T[]>([]);

  useEffect(() => {
    historyRef.current = [value, ...historyRef.current].slice(0, maxHistory);
  }, [value, maxHistory]);

  return historyRef.current;
}

/**
 * Hook to detect value direction changes (for numbers)
 */
export function useValueDirection(value: number): 'up' | 'down' | 'same' | 'initial' {
  const previous = usePrevious(value);

  if (previous === undefined) return 'initial';
  if (value > previous) return 'up';
  if (value < previous) return 'down';
  return 'same';
}

export default usePrevious;

