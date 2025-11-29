/**
 * Wallet Context
 * Provides wallet state and actions throughout the app
 */

import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react';
import { useAccount, useChainId, useBalance } from 'wagmi';
import type { Address } from 'viem';

import { truncateAddress } from '@/services/wallet.service';

/**
 * Wallet state interface
 */
interface WalletState {
  address: Address | undefined;
  chainId: number | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  balance: bigint | undefined;
  formattedBalance: string;
  displayName: string;
  shortAddress: string;
}

/**
 * Wallet actions interface
 */
interface WalletActions {
  refreshBalance: () => void;
}

/**
 * Wallet context type
 */
interface WalletContextType {
  state: WalletState;
  actions: WalletActions;
}

/**
 * Default wallet state
 */
const defaultState: WalletState = {
  address: undefined,
  chainId: undefined,
  isConnected: false,
  isConnecting: false,
  balance: undefined,
  formattedBalance: '0',
  displayName: '',
  shortAddress: '',
};

/**
 * Create context
 */
const WalletContext = createContext<WalletContextType | undefined>(undefined);

/**
 * Wallet provider props
 */
interface WalletProviderProps {
  children: React.ReactNode;
}

/**
 * Wallet provider component
 */
export function WalletProvider({ children }: WalletProviderProps) {
  const { address, isConnected, isConnecting } = useAccount();
  const chainId = useChainId();
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address,
  });

  const [ensName, setEnsName] = useState<string | undefined>();

  // Format balance
  const formattedBalance = useMemo(() => {
    if (!balanceData) return '0';
    const value = Number(balanceData.value) / 1e18;
    if (value < 0.0001) return '< 0.0001';
    return value.toFixed(4);
  }, [balanceData]);

  // Display name (ENS or truncated address)
  const displayName = useMemo(() => {
    if (ensName) return ensName;
    if (address) return truncateAddress(address);
    return '';
  }, [ensName, address]);

  // Short address
  const shortAddress = useMemo(() => {
    if (!address) return '';
    return truncateAddress(address, 6, 4);
  }, [address]);

  // Refresh balance action
  const refreshBalance = useCallback(() => {
    refetchBalance();
  }, [refetchBalance]);

  // Build state
  const state: WalletState = useMemo(() => ({
    address,
    chainId,
    isConnected,
    isConnecting,
    balance: balanceData?.value,
    formattedBalance,
    displayName,
    shortAddress,
  }), [
    address,
    chainId,
    isConnected,
    isConnecting,
    balanceData?.value,
    formattedBalance,
    displayName,
    shortAddress,
  ]);

  // Build actions
  const actions: WalletActions = useMemo(() => ({
    refreshBalance,
  }), [refreshBalance]);

  // Context value
  const value = useMemo(() => ({
    state,
    actions,
  }), [state, actions]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

/**
 * Hook to use wallet context
 */
export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  
  return context;
}

/**
 * Hook to use wallet state only
 */
export function useWalletState(): WalletState {
  const { state } = useWallet();
  return state;
}

/**
 * Hook to use wallet actions only
 */
export function useWalletActions(): WalletActions {
  const { actions } = useWallet();
  return actions;
}

export default WalletContext;

