import { useState, useEffect, useCallback, useRef } from 'react';

export interface ContractReadOptions<T> {
  address: string;
  abi: readonly unknown[];
  functionName: string;
  args?: unknown[];
  chainId?: number;
  enabled?: boolean;
  watch?: boolean;
  pollingInterval?: number;
  select?: (data: unknown) => T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface ContractReadResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isStale: boolean;
}

const DEFAULT_POLLING_INTERVAL = 4000;

/**
 * Generic hook for reading data from a smart contract.
 * Supports polling for real-time updates and data transformation.
 */
export function useContractRead<T = unknown>({
  address,
  abi,
  functionName,
  args = [],
  chainId = 1,
  enabled = true,
  watch = false,
  pollingInterval = DEFAULT_POLLING_INTERVAL,
  select,
  onSuccess,
  onError,
}: ContractReadOptions<T>): ContractReadResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchData = useCallback(async () => {
    if (!address || !functionName || !enabled) {
      return;
    }

    setLoading(data === null);
    setError(null);

    try {
      const result = await callContractFunction({
        address,
        abi,
        functionName,
        args,
        chainId,
      });

      const transformedData = select ? select(result) : result as T;
      
      setData(transformedData);
      setIsStale(false);
      lastFetchRef.current = Date.now();
      
      onSuccess?.(transformedData);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Contract read failed');
      setError(errorObj);
      setIsStale(true);
      onError?.(errorObj);
    } finally {
      setLoading(false);
    }
  }, [address, abi, functionName, args, chainId, enabled, select, onSuccess, onError, data]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up polling if watch is enabled
  useEffect(() => {
    if (!watch || !enabled) {
      return;
    }

    intervalRef.current = setInterval(fetchData, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [watch, enabled, pollingInterval, fetchData]);

  // Mark as stale after some time
  useEffect(() => {
    if (!data) return;

    const checkStale = setInterval(() => {
      const elapsed = Date.now() - lastFetchRef.current;
      if (elapsed > pollingInterval * 2) {
        setIsStale(true);
      }
    }, pollingInterval);

    return () => clearInterval(checkStale);
  }, [data, pollingInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    isStale,
  };
}

interface CallContractParams {
  address: string;
  abi: readonly unknown[];
  functionName: string;
  args: unknown[];
  chainId: number;
}

async function callContractFunction({
  address,
  abi,
  functionName,
  args,
  chainId,
}: CallContractParams): Promise<unknown> {
  // In production, this would use ethers.js, viem, or wagmi
  const response = await fetch('/api/contract/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address,
      abi,
      functionName,
      args,
      chainId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Contract call failed');
  }

  const data = await response.json();
  return data.result;
}

/**
 * Hook to read multiple values from a contract in parallel
 */
export function useContractReads<T extends unknown[]>(
  configs: Array<Omit<ContractReadOptions<unknown>, 'watch' | 'pollingInterval' | 'select' | 'onSuccess' | 'onError'>>
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    if (configs.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        configs.map(config =>
          callContractFunction({
            address: config.address,
            abi: config.abi,
            functionName: config.functionName,
            args: config.args || [],
            chainId: config.chainId || 1,
          })
        )
      );

      setData(results as T);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Batch read failed'));
    } finally {
      setLoading(false);
    }
  }, [configs]);

  useEffect(() => {
    const allEnabled = configs.every(c => c.enabled !== false);
    if (allEnabled) {
      fetchAll();
    }
  }, [fetchAll, configs]);

  return { data, loading, error, refetch: fetchAll };
}

export default useContractRead;

