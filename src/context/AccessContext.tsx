/**
 * Access Context
 * Provides access state and token gating functionality
 */

import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

import { useAccess } from '@/hooks/useAccess';
import type { AccessTier } from '@/types/nft.types';

/**
 * Access state interface
 */
interface AccessState {
  hasAccess: boolean;
  isLoading: boolean;
  isChecking: boolean;
  accessTier: AccessTier | null;
  tokenBalance: bigint;
  lastChecked: number | null;
  error: Error | null;
}

/**
 * Access actions interface
 */
interface AccessActions {
  checkAccess: () => Promise<void>;
  refreshAccess: () => void;
  clearError: () => void;
}

/**
 * Access context type
 */
interface AccessContextType {
  state: AccessState;
  actions: AccessActions;
}

/**
 * Default access state
 */
const defaultState: AccessState = {
  hasAccess: false,
  isLoading: false,
  isChecking: false,
  accessTier: null,
  tokenBalance: 0n,
  lastChecked: null,
  error: null,
};

/**
 * Create context
 */
const AccessContext = createContext<AccessContextType | undefined>(undefined);

/**
 * Determine access tier from balance
 */
function determineAccessTier(balance: bigint): AccessTier | null {
  if (balance === 0n) return null;
  if (balance >= 10n) return 'vip';
  if (balance >= 5n) return 'premium';
  if (balance >= 2n) return 'standard';
  return 'basic';
}

/**
 * Access provider props
 */
interface AccessProviderProps {
  children: React.ReactNode;
  autoCheck?: boolean;
  checkInterval?: number;
}

/**
 * Access provider component
 */
export function AccessProvider({ 
  children, 
  autoCheck = true,
  checkInterval = 60000, // 1 minute
}: AccessProviderProps) {
  const { address, isConnected } = useAccount();
  const { hasAccess, checkAccess: checkAccessHook, isLoading } = useAccess(address);
  
  const [error, setError] = useState<Error | null>(null);
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  const [tokenBalance, setTokenBalance] = useState<bigint>(0n);

  // Check access function
  const checkAccess = useCallback(async () => {
    if (!isConnected || !address) {
      setError(new Error('Wallet not connected'));
      return;
    }

    try {
      setError(null);
      await checkAccessHook();
      setLastChecked(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check access'));
    }
  }, [isConnected, address, checkAccessHook]);

  // Refresh access (alias for checkAccess)
  const refreshAccess = useCallback(() => {
    checkAccess();
  }, [checkAccess]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-check on connection
  useEffect(() => {
    if (autoCheck && isConnected && address) {
      checkAccess();
    }
  }, [autoCheck, isConnected, address, checkAccess]);

  // Periodic refresh
  useEffect(() => {
    if (!autoCheck || !isConnected || checkInterval <= 0) return;

    const interval = setInterval(() => {
      checkAccess();
    }, checkInterval);

    return () => clearInterval(interval);
  }, [autoCheck, isConnected, checkInterval, checkAccess]);

  // Determine access tier
  const accessTier = useMemo(() => {
    return determineAccessTier(tokenBalance);
  }, [tokenBalance]);

  // Build state
  const state: AccessState = useMemo(() => ({
    hasAccess,
    isLoading,
    isChecking: isLoading,
    accessTier,
    tokenBalance,
    lastChecked,
    error,
  }), [hasAccess, isLoading, accessTier, tokenBalance, lastChecked, error]);

  // Build actions
  const actions: AccessActions = useMemo(() => ({
    checkAccess,
    refreshAccess,
    clearError,
  }), [checkAccess, refreshAccess, clearError]);

  // Context value
  const value = useMemo(() => ({
    state,
    actions,
  }), [state, actions]);

  return (
    <AccessContext.Provider value={value}>
      {children}
    </AccessContext.Provider>
  );
}

/**
 * Hook to use access context
 */
export function useAccessContext(): AccessContextType {
  const context = useContext(AccessContext);
  
  if (!context) {
    throw new Error('useAccessContext must be used within an AccessProvider');
  }
  
  return context;
}

/**
 * Hook to use access state only
 */
export function useAccessState(): AccessState {
  const { state } = useAccessContext();
  return state;
}

/**
 * Hook to use access actions only
 */
export function useAccessActions(): AccessActions {
  const { actions } = useAccessContext();
  return actions;
}

/**
 * Hook to check if user has specific tier access
 */
export function useHasTierAccess(requiredTier: AccessTier): boolean {
  const { state } = useAccessContext();
  
  if (!state.hasAccess || !state.accessTier) return false;
  
  const tierOrder: AccessTier[] = ['basic', 'standard', 'premium', 'vip'];
  const userTierIndex = tierOrder.indexOf(state.accessTier);
  const requiredTierIndex = tierOrder.indexOf(requiredTier);
  
  return userTierIndex >= requiredTierIndex;
}

export default AccessContext;

