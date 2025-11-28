import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useContract, useHasNFT } from './useContract';

interface TokenGatingState {
  hasAccess: boolean;
  isLoading: boolean;
  isChecking: boolean;
  error: Error | null;
  tokenBalance: bigint | null;
}

interface UseTokenGatingReturn extends TokenGatingState {
  checkAccess: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook for token-gated access control
 */
export function useTokenGating(): UseTokenGatingReturn {
  const { address, isConnected } = useAccount();
  const { readContract, error: contractError } = useContract();
  const [state, setState] = useState<TokenGatingState>({
    hasAccess: false,
    isLoading: true,
    isChecking: false,
    error: null,
    tokenBalance: null,
  });

  const checkAccess = useCallback(async () => {
    if (!address || !isConnected) {
      setState(prev => ({
        ...prev,
        hasAccess: false,
        isLoading: false,
        isChecking: false,
        tokenBalance: null,
      }));
      return;
    }

    setState(prev => ({ ...prev, isChecking: true, error: null }));

    try {
      const balance = await readContract<bigint>('balanceOf', [address]);
      
      if (balance !== null) {
        setState({
          hasAccess: balance > 0n,
          isLoading: false,
          isChecking: false,
          error: null,
          tokenBalance: balance,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isChecking: false,
          error: contractError || new Error('Failed to check balance'),
        }));
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        hasAccess: false,
        isLoading: false,
        isChecking: false,
        error: err instanceof Error ? err : new Error('Unknown error'),
      }));
    }
  }, [address, isConnected, readContract, contractError]);

  const refresh = useCallback(async () => {
    await checkAccess();
  }, [checkAccess]);

  // Check access when wallet connects or address changes
  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return { ...state, checkAccess, refresh };
}

/**
 * Hook for gating content based on NFT ownership
 */
export function useGatedContent<T>(
  unlockedContent: T,
  lockedContent: T
): {
  content: T;
  isUnlocked: boolean;
  isLoading: boolean;
} {
  const { hasAccess, isLoading } = useTokenGating();

  return {
    content: hasAccess ? unlockedContent : lockedContent,
    isUnlocked: hasAccess,
    isLoading,
  };
}

/**
 * Hook for checking access with custom requirements
 */
export function useCustomTokenGating(
  minBalance: bigint = 1n
): UseTokenGatingReturn {
  const gating = useTokenGating();

  const hasAccess = gating.tokenBalance !== null && gating.tokenBalance >= minBalance;

  return {
    ...gating,
    hasAccess,
  };
}

/**
 * HOC-style hook for protected routes
 */
export function useProtectedRoute(redirectPath: string = '/'): {
  isAuthorized: boolean;
  isLoading: boolean;
  shouldRedirect: boolean;
} {
  const { hasAccess, isLoading } = useTokenGating();
  const { isConnected } = useAccount();

  const shouldRedirect = !isLoading && (!isConnected || !hasAccess);

  return {
    isAuthorized: hasAccess,
    isLoading,
    shouldRedirect,
  };
}

export default useTokenGating;

