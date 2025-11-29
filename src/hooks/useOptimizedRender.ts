/**
 * useOptimizedRender Hook
 * Utilities for optimizing component renders
 */

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';

/**
 * Track component render count (development only)
 */
export function useRenderCount(componentName?: string): number {
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  if (process.env.NODE_ENV === 'development' && componentName) {
    console.log(`[Render] ${componentName}: ${renderCount.current}`);
  }
  
  return renderCount.current;
}

/**
 * Track what caused a re-render
 */
export function useWhyDidYouUpdate<T extends Record<string, unknown>>(
  name: string,
  props: T
): void {
  const previousProps = useRef<T>();
  
  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props }) as Array<keyof T>;
      const changesObj: Partial<Record<keyof T, { from: unknown; to: unknown }>> = {};
      
      allKeys.forEach(key => {
        if (previousProps.current![key] !== props[key]) {
          changesObj[key] = {
            from: previousProps.current![key],
            to: props[key],
          };
        }
      });
      
      if (Object.keys(changesObj).length) {
        console.log('[WhyDidYouUpdate]', name, changesObj);
      }
    }
    
    previousProps.current = props;
  });
}

/**
 * Skip initial render effect
 */
export function useUpdateEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
): void {
  const isFirstMount = useRef(true);
  
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Defer state update to next frame for better performance
 */
export function useDeferredState<T>(initialValue: T): [T, (value: T) => void] {
  const [state, setState] = useState(initialValue);
  const frameRef = useRef<number>();
  
  const setDeferredState = useCallback((value: T) => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    
    frameRef.current = requestAnimationFrame(() => {
      setState(value);
    });
  }, []);
  
  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);
  
  return [state, setDeferredState];
}

/**
 * Batch multiple state updates
 */
export function useBatchedState<T extends Record<string, unknown>>(
  initialState: T
): [T, (updates: Partial<T>) => void] {
  const [state, setState] = useState(initialState);
  const pendingUpdates = useRef<Partial<T>>({});
  const frameRef = useRef<number>();
  
  const batchUpdate = useCallback((updates: Partial<T>) => {
    pendingUpdates.current = { ...pendingUpdates.current, ...updates };
    
    if (!frameRef.current) {
      frameRef.current = requestAnimationFrame(() => {
        setState(prev => ({ ...prev, ...pendingUpdates.current }));
        pendingUpdates.current = {};
        frameRef.current = undefined;
      });
    }
  }, []);
  
  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);
  
  return [state, batchUpdate];
}

/**
 * Optimized state that only updates when value actually changes
 */
export function useStableState<T>(
  initialValue: T,
  isEqual: (a: T, b: T) => boolean = (a, b) => a === b
): [T, (value: T) => void] {
  const [state, setState] = useState(initialValue);
  const stateRef = useRef(state);
  stateRef.current = state;
  
  const setStableState = useCallback(
    (value: T) => {
      if (!isEqual(stateRef.current, value)) {
        setState(value);
      }
    },
    [isEqual]
  );
  
  return [state, setStableState];
}

/**
 * Get previous value of a prop or state
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * Force component update
 */
export function useForceUpdate(): () => void {
  const [, setTick] = useState(0);
  return useCallback(() => setTick(tick => tick + 1), []);
}

/**
 * Memoize async function result
 */
export function useAsyncMemo<T>(
  factory: () => Promise<T>,
  deps: React.DependencyList,
  initialValue: T
): T {
  const [value, setValue] = useState<T>(initialValue);
  
  useEffect(() => {
    let mounted = true;
    
    factory().then(result => {
      if (mounted) {
        setValue(result);
      }
    });
    
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  
  return value;
}

/**
 * Create a selector that only re-renders when selected value changes
 */
export function useSelector<TStore, TSelected>(
  store: TStore,
  selector: (store: TStore) => TSelected
): TSelected {
  const selectedRef = useRef<TSelected>();
  
  const selected = useMemo(() => selector(store), [store, selector]);
  
  if (selectedRef.current !== selected) {
    selectedRef.current = selected;
  }
  
  return selectedRef.current!;
}

export default {
  useRenderCount,
  useWhyDidYouUpdate,
  useUpdateEffect,
  useDeferredState,
  useBatchedState,
  useStableState,
  usePrevious,
  useForceUpdate,
  useAsyncMemo,
  useSelector,
};

