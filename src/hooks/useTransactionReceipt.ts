import { useState, useEffect, useCallback, useRef } from 'react';

export type TransactionStatus = 
  | 'pending'
  | 'confirming'
  | 'confirmed'
  | 'failed'
  | 'cancelled';

export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  from: string;
  to: string;
  contractAddress?: string;
  gasUsed: bigint;
  effectiveGasPrice: bigint;
  status: 'success' | 'reverted';
  logs: TransactionLog[];
  confirmations: number;
}

export interface TransactionLog {
  address: string;
  topics: string[];
  data: string;
  logIndex: number;
  transactionIndex: number;
}

export interface UseTransactionReceiptOptions {
  hash: string | undefined;
  chainId?: number;
  confirmations?: number;
  pollingInterval?: number;
  enabled?: boolean;
  onSuccess?: (receipt: TransactionReceipt) => void;
  onError?: (error: Error) => void;
}

export interface UseTransactionReceiptResult {
  receipt: TransactionReceipt | null;
  status: TransactionStatus;
  loading: boolean;
  error: Error | null;
  confirmationCount: number;
  isConfirmed: boolean;
}

const DEFAULT_CONFIRMATIONS = 1;
const DEFAULT_POLLING_INTERVAL = 4000; // 4 seconds

/**
 * Hook to track transaction receipt and confirmation status.
 * Polls for transaction receipt until confirmed or failed.
 */
export function useTransactionReceipt({
  hash,
  chainId = 1,
  confirmations = DEFAULT_CONFIRMATIONS,
  pollingInterval = DEFAULT_POLLING_INTERVAL,
  enabled = true,
  onSuccess,
  onError,
}: UseTransactionReceiptOptions): UseTransactionReceiptResult {
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const [status, setStatus] = useState<TransactionStatus>('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [confirmationCount, setConfirmationCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCalledSuccess = useRef(false);

  const fetchReceipt = useCallback(async () => {
    if (!hash || !enabled) return;

    try {
      const response = await fetch(
        `/api/transaction/receipt?hash=${hash}&chainId=${chainId}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Transaction not yet mined
          setStatus('pending');
          return;
        }
        throw new Error('Failed to fetch transaction receipt');
      }

      const data = await response.json();

      if (!data.receipt) {
        setStatus('pending');
        return;
      }

      const txReceipt: TransactionReceipt = {
        transactionHash: data.receipt.transactionHash,
        blockNumber: data.receipt.blockNumber,
        blockHash: data.receipt.blockHash,
        from: data.receipt.from,
        to: data.receipt.to,
        contractAddress: data.receipt.contractAddress,
        gasUsed: BigInt(data.receipt.gasUsed),
        effectiveGasPrice: BigInt(data.receipt.effectiveGasPrice),
        status: data.receipt.status === 1 ? 'success' : 'reverted',
        logs: data.receipt.logs || [],
        confirmations: data.confirmations || 0,
      };

      setReceipt(txReceipt);
      setConfirmationCount(txReceipt.confirmations);

      if (txReceipt.status === 'reverted') {
        setStatus('failed');
        setError(new Error('Transaction reverted'));
        onError?.(new Error('Transaction reverted'));
        return;
      }

      if (txReceipt.confirmations >= confirmations) {
        setStatus('confirmed');
        if (!hasCalledSuccess.current) {
          hasCalledSuccess.current = true;
          onSuccess?.(txReceipt);
        }
      } else {
        setStatus('confirming');
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error');
      setError(errorObj);
      onError?.(errorObj);
    }
  }, [hash, chainId, confirmations, enabled, onSuccess, onError]);

  // Initial fetch and polling
  useEffect(() => {
    if (!hash || !enabled) {
      setReceipt(null);
      setStatus('pending');
      setConfirmationCount(0);
      hasCalledSuccess.current = false;
      return;
    }

    setLoading(true);
    fetchReceipt().finally(() => setLoading(false));

    // Poll until confirmed
    intervalRef.current = setInterval(() => {
      if (status !== 'confirmed' && status !== 'failed') {
        fetchReceipt();
      }
    }, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [hash, enabled, pollingInterval, fetchReceipt, status]);

  // Stop polling when confirmed or failed
  useEffect(() => {
    if ((status === 'confirmed' || status === 'failed') && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [status]);

  return {
    receipt,
    status,
    loading,
    error,
    confirmationCount,
    isConfirmed: status === 'confirmed',
  };
}

/**
 * Hook to track multiple transactions at once
 */
export function useTransactionReceipts(
  hashes: string[],
  options: Omit<UseTransactionReceiptOptions, 'hash'> = {}
): Map<string, UseTransactionReceiptResult> {
  const [results, setResults] = useState<Map<string, UseTransactionReceiptResult>>(
    new Map()
  );

  useEffect(() => {
    const newResults = new Map<string, UseTransactionReceiptResult>();
    
    hashes.forEach(hash => {
      // This is a simplified version - in production, use individual hooks
      newResults.set(hash, {
        receipt: null,
        status: 'pending',
        loading: true,
        error: null,
        confirmationCount: 0,
        isConfirmed: false,
      });
    });

    setResults(newResults);
  }, [hashes]);

  return results;
}

/**
 * Helper to get explorer URL for a transaction
 */
export function getExplorerTxUrl(hash: string, chainId: number): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io/tx/',
    5: 'https://goerli.etherscan.io/tx/',
    11155111: 'https://sepolia.etherscan.io/tx/',
    137: 'https://polygonscan.com/tx/',
    42161: 'https://arbiscan.io/tx/',
    10: 'https://optimistic.etherscan.io/tx/',
    8453: 'https://basescan.org/tx/',
  };

  const baseUrl = explorers[chainId] || explorers[1];
  return `${baseUrl}${hash}`;
}

export default useTransactionReceipt;

