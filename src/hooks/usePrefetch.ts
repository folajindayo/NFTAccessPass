/**
 * usePrefetch Hook
 * Prefetch data for likely next navigations
 */

import { useCallback, useRef, useEffect } from 'react';

export interface PrefetchOptions {
  /**
   * Time to wait before prefetching (ms)
   */
  delay?: number;
  /**
   * Whether to use intersection observer
   */
  intersectionObserver?: boolean;
  /**
   * Whether to use idle callback
   */
  useIdleCallback?: boolean;
  /**
   * Custom trigger element ref
   */
  triggerRef?: React.RefObject<Element>;
}

export interface PrefetchResult<T> {
  /**
   * Trigger prefetch manually
   */
  prefetch: () => void;
  /**
   * Get cached data if available
   */
  getCachedData: () => T | null;
  /**
   * Clear cached data
   */
  clearCache: () => void;
  /**
   * Whether data is being prefetched
   */
  isPrefetching: boolean;
}

const prefetchCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

/**
 * Hook for prefetching data
 */
export function usePrefetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: PrefetchOptions = {}
): PrefetchResult<T> {
  const {
    delay = 0,
    intersectionObserver = false,
    useIdleCallback = true,
    triggerRef,
  } = options;
  
  const isPrefetchingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const observerRef = useRef<IntersectionObserver>();
  
  // Prefetch function
  const prefetch = useCallback(async () => {
    if (isPrefetchingRef.current) return;
    
    // Check if cached data is still valid
    const cached = prefetchCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return;
    }
    
    isPrefetchingRef.current = true;
    
    try {
      const data = await fetcher();
      prefetchCache.set(key, { data, timestamp: Date.now() });
    } catch (error) {
      console.warn(`[Prefetch] Failed to prefetch ${key}:`, error);
    } finally {
      isPrefetchingRef.current = false;
    }
  }, [key, fetcher]);
  
  // Schedule prefetch with delay or idle callback
  const schedulePrefetch = useCallback(() => {
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        if (useIdleCallback && 'requestIdleCallback' in window) {
          window.requestIdleCallback(() => prefetch());
        } else {
          prefetch();
        }
      }, delay);
    } else if (useIdleCallback && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => prefetch());
    } else {
      prefetch();
    }
  }, [delay, prefetch, useIdleCallback]);
  
  // Setup intersection observer
  useEffect(() => {
    if (!intersectionObserver || !triggerRef?.current) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          schedulePrefetch();
        }
      },
      { threshold: 0.1 }
    );
    
    observerRef.current.observe(triggerRef.current);
    
    return () => {
      observerRef.current?.disconnect();
    };
  }, [intersectionObserver, triggerRef, schedulePrefetch]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Get cached data
  const getCachedData = useCallback((): T | null => {
    const cached = prefetchCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as T;
    }
    return null;
  }, [key]);
  
  // Clear cache
  const clearCache = useCallback(() => {
    prefetchCache.delete(key);
  }, [key]);
  
  return {
    prefetch: schedulePrefetch,
    getCachedData,
    clearCache,
    isPrefetching: isPrefetchingRef.current,
  };
}

/**
 * Hook for prefetching on hover
 */
export function usePrefetchOnHover<T>(
  key: string,
  fetcher: () => Promise<T>
): {
  onMouseEnter: () => void;
  getCachedData: () => T | null;
} {
  const { prefetch, getCachedData } = usePrefetch(key, fetcher, {
    delay: 100,
    useIdleCallback: false,
  });
  
  return {
    onMouseEnter: prefetch,
    getCachedData,
  };
}

/**
 * Hook for prefetching on focus
 */
export function usePrefetchOnFocus<T>(
  key: string,
  fetcher: () => Promise<T>
): {
  onFocus: () => void;
  getCachedData: () => T | null;
} {
  const { prefetch, getCachedData } = usePrefetch(key, fetcher, {
    delay: 50,
    useIdleCallback: true,
  });
  
  return {
    onFocus: prefetch,
    getCachedData,
  };
}

/**
 * Clear all prefetch cache
 */
export function clearAllPrefetchCache(): void {
  prefetchCache.clear();
}

/**
 * Get prefetch cache stats
 */
export function getPrefetchCacheStats(): {
  size: number;
  keys: string[];
} {
  return {
    size: prefetchCache.size,
    keys: Array.from(prefetchCache.keys()),
  };
}

export default usePrefetch;

