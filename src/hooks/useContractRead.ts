/**
 * useContractRead Hook
 * Generic hook for reading contract data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { type Address, type Abi } from 'viem';

export interface ContractReadConfig<T = unknown> {
  address: Address | undefined;
  abi: Abi;
  functionName: string;
  args?: unknown[];
  enabled?: boolean;
  watch?: boolean;
  cacheTime?: number;
  staleTime?: number;
  refetchInterval?: number | false;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface ContractReadResult<T = unknown> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  refetch: () => Promise<T | undefined>;
  isFetching: boolean;
}

// Simple cache implementation
const cache = new Map<string, { data: unknown; timestamp: number }>();

function getCacheKey(config: ContractReadConfig): string {
  return `${config.address}-${config.functionName}-${JSON.stringify(config.args ?? [])}`;
}

export function useContractRead<T = unknown>(
  config: ContractReadConfig<T>
): ContractReadResult<T> {
  const {
    address,
    abi,
    functionName,
    args = [],
    enabled = true,
    watch = false,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 0,
    refetchInterval = false,
    onSuccess,
    onError,
  } = config;

  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const mountedRef = useRef(true);
  const fetchIdRef = useRef(0);

  const fetchData = useCallback(async (): Promise<T | undefined> => {
    if (!address || !enabled) {
      return undefined;
    }

    const cacheKey = getCacheKey(config);
    const cached = cache.get(cacheKey);

    // Return cached data if still fresh
    if (cached && Date.now() - cached.timestamp < staleTime) {
      setData(cached.data as T);
      setIsSuccess(true);
      return cached.data as T;
    }

    const fetchId = ++fetchIdRef.current;
    
    if (!data) {
      setIsLoading(true);
    }
    setIsFetching(true);
    setError(null);

    try {
      // In production, use viem's readContract
      // For now, simulate the read
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock response based on function name
      let result: unknown;
      
      switch (functionName) {
        case 'balanceOf':
          result = BigInt(Math.floor(Math.random() * 100));
          break;
        case 'ownerOf':
          result = address;
          break;
        case 'totalSupply':
          result = BigInt(10000);
          break;
        case 'tokenURI':
          result = `ipfs://QmExample/${args[0]}/metadata.json`;
          break;
        case 'isApprovedForAll':
          result = Math.random() > 0.5;
          break;
        case 'getApproved':
          result = '0x0000000000000000000000000000000000000000' as Address;
          break;
        case 'name':
          result = 'NFT Collection';
          break;
        case 'symbol':
          result = 'NFT';
          break;
        case 'supportsInterface':
          result = true;
          break;
        default:
          result = null;
      }

      // Only update if this is the latest fetch
      if (fetchId !== fetchIdRef.current || !mountedRef.current) {
        return undefined;
      }

      const typedResult = result as T;

      // Update cache
      cache.set(cacheKey, { data: typedResult, timestamp: Date.now() });

      // Clean old cache entries
      if (cache.size > 100) {
        const entries = Array.from(cache.entries());
        const sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        for (let i = 0; i < 20; i++) {
          cache.delete(sortedEntries[i][0]);
        }
      }

      setData(typedResult);
      setIsSuccess(true);
      setError(null);
      onSuccess?.(typedResult);

      return typedResult;
    } catch (err) {
      if (fetchId !== fetchIdRef.current || !mountedRef.current) {
        return undefined;
      }

      const error = err instanceof Error ? err : new Error('Contract read failed');
      setError(error);
      setIsSuccess(false);
      onError?.(error);

      return undefined;
    } finally {
      if (fetchId === fetchIdRef.current && mountedRef.current) {
        setIsLoading(false);
        setIsFetching(false);
      }
    }
  }, [address, enabled, functionName, args, staleTime, data, onSuccess, onError, config]);

  // Initial fetch
  useEffect(() => {
    if (enabled && address) {
      fetchData();
    }
  }, [enabled, address, functionName, JSON.stringify(args)]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled || !address) {
      return;
    }

    const interval = setInterval(fetchData, refetchInterval);
    return () => clearInterval(interval);
  }, [refetchInterval, enabled, address, fetchData]);

  // Watch for block changes (simplified)
  useEffect(() => {
    if (!watch || !enabled || !address) {
      return;
    }

    // In production, subscribe to new blocks
    const interval = setInterval(fetchData, 12000); // ~1 block
    return () => clearInterval(interval);
  }, [watch, enabled, address, fetchData]);

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    isLoading,
    isError: error !== null,
    error,
    isSuccess,
    refetch: fetchData,
    isFetching,
  };
}

/**
 * Clear all cached data
 */
export function clearContractReadCache(): void {
  cache.clear();
}

/**
 * Clear specific cache entry
 */
export function invalidateContractRead(config: Partial<ContractReadConfig>): void {
  if (config.address && config.functionName) {
    const partialKey = `${config.address}-${config.functionName}`;
    for (const key of cache.keys()) {
      if (key.startsWith(partialKey)) {
        cache.delete(key);
      }
    }
  }
}

export default useContractRead;
