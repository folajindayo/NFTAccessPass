import { useState, useCallback, useRef } from 'react';

import { MintResponse } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

export type MintState = 
  | 'idle'
  | 'preparing'
  | 'awaiting_approval'
  | 'minting'
  | 'confirming'
  | 'success'
  | 'error';

export interface MintError {
  code: string;
  message: string;
  details?: unknown;
}

export interface MintResult {
  tokenId: string;
  transactionHash: string;
  blockNumber: number;
}

export interface UseMintOptions {
  address?: string;
  contractAddress?: string;
  onSuccess?: (result: MintResult) => void;
  onError?: (error: MintError) => void;
  maxRetries?: number;
  retryDelay?: number;
}

export interface UseMintResult {
  mintPass: () => Promise<MintResult | null>;
  state: MintState;
  loading: boolean;
  message: string;
  error: MintError | null;
  result: MintResult | null;
  transactionHash: string | null;
  reset: () => void;
  setMessage: (message: string) => void;
}

const ERROR_CODES: Record<string, string> = {
  USER_REJECTED: 'Transaction was rejected by user',
  INSUFFICIENT_FUNDS: 'Insufficient funds for transaction',
  CONTRACT_ERROR: 'Smart contract execution failed',
  NETWORK_ERROR: 'Network connection error',
  TIMEOUT: 'Transaction confirmation timeout',
  UNKNOWN: 'An unexpected error occurred',
};

/**
 * Custom hook to handle the NFT minting process.
 * Includes retry logic, detailed error handling, and state tracking.
 */
export const useMint = ({
  address,
  contractAddress,
  onSuccess,
  onError,
  maxRetries = 3,
  retryDelay = 1000,
}: UseMintOptions = {}): UseMintResult => {
  const [state, setState] = useState<MintState>('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<MintError | null>(null);
  const [result, setResult] = useState<MintResult | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  
  const { t } = useTranslation();
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setState('idle');
    setMessage('');
    setError(null);
    setResult(null);
    setTransactionHash(null);
    retryCountRef.current = 0;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const parseError = useCallback((err: unknown): MintError => {
    if (err instanceof Error) {
      // Check for common wallet errors
      if (err.message.includes('rejected') || err.message.includes('denied')) {
        return { code: 'USER_REJECTED', message: ERROR_CODES.USER_REJECTED };
      }
      if (err.message.includes('insufficient')) {
        return { code: 'INSUFFICIENT_FUNDS', message: ERROR_CODES.INSUFFICIENT_FUNDS };
      }
      if (err.message.includes('revert')) {
        return { code: 'CONTRACT_ERROR', message: ERROR_CODES.CONTRACT_ERROR, details: err.message };
      }
      return { code: 'UNKNOWN', message: err.message };
    }
    return { code: 'UNKNOWN', message: ERROR_CODES.UNKNOWN };
  }, []);

  const mintWithRetry = useCallback(async (): Promise<MintResponse> => {
    abortControllerRef.current = new AbortController();
    
    const attemptMint = async (): Promise<MintResponse> => {
      const res = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, contractAddress }),
        signal: abortControllerRef.current?.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      return res.json();
    };

    let lastError: Error | null = null;

    while (retryCountRef.current < maxRetries) {
      try {
        return await attemptMint();
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        
        // Don't retry on user rejection or abort
        if (
          lastError.message.includes('rejected') ||
          lastError.name === 'AbortError'
        ) {
          throw lastError;
        }

        retryCountRef.current++;
        
        if (retryCountRef.current < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * retryCountRef.current));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }, [address, contractAddress, maxRetries, retryDelay]);

  const mintPass = useCallback(async (): Promise<MintResult | null> => {
    if (!address) {
      const err: MintError = { code: 'NO_ADDRESS', message: 'Wallet address is required' };
      setError(err);
      onError?.(err);
      return null;
    }

    reset();
    setState('preparing');
    setMessage(t('common.minting'));

    try {
      setState('awaiting_approval');
      setMessage('Waiting for wallet approval...');

      setState('minting');
      setMessage('Minting your NFT...');

      const data = await mintWithRetry();

      if (data.success && data.tokenId && data.transactionHash) {
        setState('confirming');
        setMessage('Confirming transaction...');
        setTransactionHash(data.transactionHash);

        const mintResult: MintResult = {
          tokenId: data.tokenId,
          transactionHash: data.transactionHash,
          blockNumber: data.blockNumber || 0,
        };

        setState('success');
        setMessage(t('common.mintSuccess'));
        setResult(mintResult);
        onSuccess?.(mintResult);

        return mintResult;
      } else {
        throw new Error(data.error || 'Mint failed');
      }
    } catch (err) {
      const mintError = parseError(err);
      setState('error');
      setMessage(mintError.message);
      setError(mintError);
      onError?.(mintError);
      return null;
    }
  }, [address, t, mintWithRetry, reset, parseError, onSuccess, onError]);

  return {
    mintPass,
    state,
    loading: state !== 'idle' && state !== 'success' && state !== 'error',
    message,
    error,
    result,
    transactionHash,
    reset,
    setMessage,
  };
};
