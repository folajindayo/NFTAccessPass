import { useState, useEffect, useCallback, useRef } from 'react';

export interface GasPriceData {
  slow: bigint;
  standard: bigint;
  fast: bigint;
  instant: bigint;
  baseFee: bigint;
  lastBlock: number;
  timestamp: number;
}

export interface UseGasPriceOptions {
  chainId?: number;
  refreshInterval?: number;
  enabled?: boolean;
}

export interface UseGasPriceResult {
  data: GasPriceData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isStale: boolean;
}

const DEFAULT_REFRESH_INTERVAL = 15000; // 15 seconds
const STALE_THRESHOLD = 60000; // 1 minute

/**
 * Hook to fetch real-time gas price estimates.
 * Provides slow, standard, fast, and instant gas price options.
 */
export function useGasPrice({
  chainId = 1,
  refreshInterval = DEFAULT_REFRESH_INTERVAL,
  enabled = true,
}: UseGasPriceOptions = {}): UseGasPriceResult {
  const [data, setData] = useState<GasPriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchGasPrice = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const gasPrices = await getGasPrices(chainId);
      setData(gasPrices);
      setIsStale(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch gas prices'));
    } finally {
      setLoading(false);
    }
  }, [chainId, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchGasPrice();
  }, [fetchGasPrice]);

  // Set up polling
  useEffect(() => {
    if (!enabled || refreshInterval <= 0) return;

    intervalRef.current = setInterval(fetchGasPrice, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, refreshInterval, fetchGasPrice]);

  // Check staleness
  useEffect(() => {
    if (!data) return;

    const checkStale = () => {
      const now = Date.now();
      setIsStale(now - data.timestamp > STALE_THRESHOLD);
    };

    const staleInterval = setInterval(checkStale, 10000);
    return () => clearInterval(staleInterval);
  }, [data]);

  return {
    data,
    loading,
    error,
    refetch: fetchGasPrice,
    isStale,
  };
}

async function getGasPrices(chainId: number): Promise<GasPriceData> {
  // In production, this would call an RPC or gas API
  const response = await fetch(`/api/gas?chainId=${chainId}`);

  if (!response.ok) {
    // Fallback to default estimates if API fails
    return getDefaultGasPrices(chainId);
  }

  const data = await response.json();
  
  return {
    slow: BigInt(data.slow || '10000000000'),
    standard: BigInt(data.standard || '15000000000'),
    fast: BigInt(data.fast || '20000000000'),
    instant: BigInt(data.instant || '30000000000'),
    baseFee: BigInt(data.baseFee || '10000000000'),
    lastBlock: data.lastBlock || 0,
    timestamp: Date.now(),
  };
}

function getDefaultGasPrices(chainId: number): GasPriceData {
  // Default gas prices based on chain
  const defaults: Record<number, { base: bigint; multipliers: number[] }> = {
    1: { base: 20000000000n, multipliers: [0.8, 1, 1.2, 1.5] },
    137: { base: 50000000000n, multipliers: [0.8, 1, 1.2, 1.5] },
    42161: { base: 100000000n, multipliers: [0.8, 1, 1.2, 1.5] },
    10: { base: 1000000n, multipliers: [0.8, 1, 1.2, 1.5] },
    8453: { base: 1000000n, multipliers: [0.8, 1, 1.2, 1.5] },
  };

  const config = defaults[chainId] || defaults[1];
  const base = config.base;
  const [slowMult, stdMult, fastMult, instMult] = config.multipliers;

  return {
    slow: BigInt(Math.floor(Number(base) * slowMult)),
    standard: base,
    fast: BigInt(Math.floor(Number(base) * fastMult)),
    instant: BigInt(Math.floor(Number(base) * instMult)),
    baseFee: base,
    lastBlock: 0,
    timestamp: Date.now(),
  };
}

/**
 * Calculate estimated gas cost in wei
 */
export function calculateGasCost(
  gasLimit: bigint,
  gasPrice: bigint,
  maxPriorityFee?: bigint
): bigint {
  const totalGasPrice = maxPriorityFee ? gasPrice + maxPriorityFee : gasPrice;
  return gasLimit * totalGasPrice;
}

/**
 * Format gas price to Gwei string
 */
export function formatGwei(wei: bigint): string {
  const gwei = Number(wei) / 1e9;
  if (gwei < 0.01) return '<0.01';
  if (gwei < 1) return gwei.toFixed(2);
  if (gwei < 100) return gwei.toFixed(1);
  return Math.round(gwei).toString();
}

/**
 * Format wei to ETH string
 */
export function formatEthFromWei(wei: bigint, decimals: number = 6): string {
  const eth = Number(wei) / 1e18;
  if (eth === 0) return '0';
  if (eth < 0.000001) return '<0.000001';
  return eth.toFixed(decimals);
}

export default useGasPrice;

