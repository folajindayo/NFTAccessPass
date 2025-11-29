/**
 * useMemoizedCallback Hook
 * Enhanced useCallback with deep dependency comparison
 */

import { useCallback, useRef, useMemo } from 'react';

/**
 * Deep equality check for objects
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  
  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  ) {
    return false;
  }
  
  const keysA = Object.keys(a as Record<string, unknown>);
  const keysB = Object.keys(b as Record<string, unknown>);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (
      !keysB.includes(key) ||
      !deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
    ) {
      return false;
    }
  }
  
  return true;
}

/**
 * useCallback with deep dependency comparison
 * Prevents unnecessary re-renders when dependencies are deeply equal
 */
export function useMemoizedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: unknown[]
): T {
  const ref = useRef<{ callback: T; deps: unknown[] }>({
    callback,
    deps,
  });
  
  // Only update if dependencies are not deeply equal
  if (!deepEqual(ref.current.deps, deps)) {
    ref.current = { callback, deps };
  }
  
  return useCallback(
    ((...args: Parameters<T>) => ref.current.callback(...args)) as T,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
}

/**
 * useMemo with deep dependency comparison
 */
export function useDeepMemo<T>(factory: () => T, deps: unknown[]): T {
  const ref = useRef<{ value: T; deps: unknown[] } | null>(null);
  
  if (ref.current === null || !deepEqual(ref.current.deps, deps)) {
    ref.current = {
      value: factory(),
      deps,
    };
  }
  
  return ref.current.value;
}

/**
 * Stable callback that always refers to the latest version
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T
): T {
  const ref = useRef<T>(callback);
  ref.current = callback;
  
  return useCallback(
    ((...args: Parameters<T>) => ref.current(...args)) as T,
    []
  );
}

/**
 * Event handler that won't cause re-renders
 */
export function useEventCallback<T extends (...args: unknown[]) => unknown>(
  handler: T
): T {
  const handlerRef = useRef<T>(handler);
  
  // Use layout effect to update ref synchronously
  handlerRef.current = handler;
  
  return useCallback(
    ((...args: Parameters<T>) => handlerRef.current(...args)) as T,
    []
  );
}

/**
 * Memoize expensive object creation
 */
export function useShallowMemo<T extends object>(value: T): T {
  const ref = useRef<T>(value);
  
  const keys = Object.keys(value) as Array<keyof T>;
  const prevKeys = Object.keys(ref.current) as Array<keyof T>;
  
  const hasChanged =
    keys.length !== prevKeys.length ||
    keys.some(key => ref.current[key] !== value[key]);
  
  if (hasChanged) {
    ref.current = value;
  }
  
  return ref.current;
}

/**
 * Debounced callback
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

/**
 * Throttled callback
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const remaining = limit - (now - lastRunRef.current);
      
      if (remaining <= 0) {
        lastRunRef.current = now;
        callbackRef.current(...args);
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          lastRunRef.current = Date.now();
          timeoutRef.current = undefined;
          callbackRef.current(...args);
        }, remaining);
      }
    },
    [limit]
  );
}

export default useMemoizedCallback;

