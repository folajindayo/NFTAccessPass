import { useState, useEffect, useCallback, useRef } from 'react';
import { CheckResponse } from '@/types';

interface UseAccessReturn {
  hasAccess: boolean;
  isLoading: boolean;
  error: Error | null;
  checkAccess: () => Promise<void>;
  reset: () => void;
  lastChecked: Date | null;
}

/**
 * Custom hook to check if an address holds the Access Pass NFT.
 * 
 * @param address - The wallet address to check.
 * @param options - Configuration options
 * @returns Object containing access status, loading state, and utilities.
 */
export const useAccess = (
  address?: string,
  options: {
    autoCheck?: boolean;
    cacheTime?: number;
    retryOnError?: boolean;
    retryDelay?: number;
  } = {}
): UseAccessReturn => {
  const {
    autoCheck = true,
    cacheTime = 30000, // 30 seconds cache
    retryOnError = false,
    retryDelay = 3000,
  } = options;

  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  
  const cacheRef = useRef<{ address: string; hasAccess: boolean; timestamp: number } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Check if cached result is still valid
   */
  const isCacheValid = useCallback((addr: string): boolean => {
    if (!cacheRef.current) return false;
    if (cacheRef.current.address !== addr) return false;
    return Date.now() - cacheRef.current.timestamp < cacheTime;
  }, [cacheTime]);

  /**
   * Calls the check API to verify NFT ownership.
   */
  const checkAccess = useCallback(async () => {
    if (!address) {
      setHasAccess(false);
      setIsLoading(false);
      return;
    }

    // Use cached result if valid
    if (isCacheValid(address)) {
      setHasAccess(cacheRef.current!.hasAccess);
      return;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/check?address=${address}`, {
        signal: abortControllerRef.current.signal,
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: CheckResponse = await res.json();
      
      // Update cache
      cacheRef.current = {
        address,
        hasAccess: data.hasAccess,
        timestamp: Date.now(),
      };

      setHasAccess(data.hasAccess);
      setLastChecked(new Date());
      setError(null);
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const error = err instanceof Error ? err : new Error('Failed to check access');
      console.error('Access check error:', error);
      setError(error);
      setHasAccess(false);

      // Retry on error if enabled
      if (retryOnError) {
        setTimeout(() => {
          checkAccess();
        }, retryDelay);
      }
    } finally {
      setIsLoading(false);
    }
  }, [address, isCacheValid, retryOnError, retryDelay]);

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setHasAccess(false);
    setIsLoading(false);
    setError(null);
    setLastChecked(null);
    cacheRef.current = null;
  }, []);

  // Auto-check on address change
  useEffect(() => {
    if (autoCheck && address) {
      checkAccess();
    } else if (!address) {
      reset();
    }

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [address, autoCheck, checkAccess, reset]);

  return { 
    hasAccess, 
    isLoading, 
    error, 
    checkAccess, 
    reset,
    lastChecked,
  };
};

/**
 * Simple access check hook (backward compatible)
 */
export const useSimpleAccess = (address?: string) => {
  const { hasAccess, checkAccess } = useAccess(address);
  return { hasAccess, checkAccess };
};

export default useAccess;
