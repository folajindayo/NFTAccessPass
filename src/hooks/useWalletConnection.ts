import { useState, useEffect, useCallback, useMemo } from 'react';

export type ConnectionState = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

export interface WalletInfo {
  address: string;
  chainId: number;
  chainName: string;
  balance: string;
  ensName: string | null;
  ensAvatar: string | null;
}

export interface UseWalletConnectionOptions {
  autoConnect?: boolean;
  targetChainId?: number;
  onConnect?: (wallet: WalletInfo) => void;
  onDisconnect?: () => void;
  onChainChanged?: (chainId: number) => void;
  onAccountChanged?: (address: string) => void;
}

export interface UseWalletConnectionResult {
  state: ConnectionState;
  wallet: WalletInfo | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  switchChain: (chainId: number) => Promise<boolean>;
  signMessage: (message: string) => Promise<string | null>;
}

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  5: 'Goerli',
  11155111: 'Sepolia',
  137: 'Polygon',
  42161: 'Arbitrum',
  10: 'Optimism',
  8453: 'Base',
};

/**
 * Unified hook for wallet connection management.
 * Handles connect, disconnect, chain switching, and message signing.
 */
export function useWalletConnection({
  autoConnect = true,
  targetChainId,
  onConnect,
  onDisconnect,
  onChainChanged,
  onAccountChanged,
}: UseWalletConnectionOptions = {}): UseWalletConnectionResult {
  const [state, setState] = useState<ConnectionState>('disconnected');
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const isConnected = state === 'connected';
  const isConnecting = state === 'connecting' || state === 'reconnecting';

  const updateWalletInfo = useCallback(async (address: string, chainId: number) => {
    try {
      const [balance, ensData] = await Promise.all([
        getBalance(address, chainId),
        getEnsData(address),
      ]);

      const walletInfo: WalletInfo = {
        address,
        chainId,
        chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
        balance,
        ensName: ensData.name,
        ensAvatar: ensData.avatar,
      };

      setWallet(walletInfo);
      return walletInfo;
    } catch {
      const basicInfo: WalletInfo = {
        address,
        chainId,
        chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
        balance: '0',
        ensName: null,
        ensAvatar: null,
      };
      setWallet(basicInfo);
      return basicInfo;
    }
  }, []);

  const connect = useCallback(async (): Promise<boolean> => {
    const provider = getProvider();
    if (!provider) {
      setError(new Error('No wallet provider found'));
      setState('error');
      return false;
    }

    setState('connecting');
    setError(null);

    try {
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const chainIdHex = await provider.request({ method: 'eth_chainId' }) as string;
      const chainId = parseInt(chainIdHex, 16);

      // Switch to target chain if specified
      if (targetChainId && chainId !== targetChainId) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${targetChainId.toString(16)}` }],
          });
        } catch {
          // Chain switch failed, continue with current chain
        }
      }

      const walletInfo = await updateWalletInfo(accounts[0], chainId);
      setState('connected');
      onConnect?.(walletInfo);
      
      return true;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Connection failed');
      setError(errorObj);
      setState('error');
      return false;
    }
  }, [targetChainId, updateWalletInfo, onConnect]);

  const disconnect = useCallback(async (): Promise<void> => {
    setWallet(null);
    setState('disconnected');
    setError(null);
    onDisconnect?.();
  }, [onDisconnect]);

  const switchChain = useCallback(async (chainId: number): Promise<boolean> => {
    const provider = getProvider();
    if (!provider) {
      setError(new Error('No wallet provider'));
      return false;
    }

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      return true;
    } catch (err: unknown) {
      const switchError = err as { code?: number };
      if (switchError.code === 4902) {
        // Chain not added, could attempt to add it
        setError(new Error('Chain not available in wallet'));
      } else {
        setError(err instanceof Error ? err : new Error('Chain switch failed'));
      }
      return false;
    }
  }, []);

  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (!wallet) {
      setError(new Error('Wallet not connected'));
      return null;
    }

    const provider = getProvider();
    if (!provider) {
      setError(new Error('No wallet provider'));
      return null;
    }

    try {
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, wallet.address],
      }) as string;

      return signature;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Signing failed'));
      return null;
    }
  }, [wallet]);

  // Set up event listeners
  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (wallet && accounts[0] !== wallet.address) {
        setState('reconnecting');
        await updateWalletInfo(accounts[0], wallet.chainId);
        setState('connected');
        onAccountChanged?.(accounts[0]);
      }
    };

    const handleChainChanged = async (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      if (wallet) {
        await updateWalletInfo(wallet.address, chainId);
        onChainChanged?.(chainId);
      }
    };

    const handleDisconnect = () => {
      disconnect();
    };

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);
    provider.on('disconnect', handleDisconnect);

    return () => {
      provider.removeListener('accountsChanged', handleAccountsChanged);
      provider.removeListener('chainChanged', handleChainChanged);
      provider.removeListener('disconnect', handleDisconnect);
    };
  }, [wallet, disconnect, updateWalletInfo, onChainChanged, onAccountChanged]);

  // Auto-connect on mount
  useEffect(() => {
    if (!autoConnect) return;

    const attemptAutoConnect = async () => {
      const provider = getProvider();
      if (!provider) return;

      try {
        const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
        if (accounts.length > 0) {
          const chainIdHex = await provider.request({ method: 'eth_chainId' }) as string;
          const chainId = parseInt(chainIdHex, 16);
          await updateWalletInfo(accounts[0], chainId);
          setState('connected');
        }
      } catch {
        // Auto-connect failed silently
      }
    };

    attemptAutoConnect();
  }, [autoConnect, updateWalletInfo]);

  return useMemo(() => ({
    state,
    wallet,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    switchChain,
    signMessage,
  }), [state, wallet, isConnected, isConnecting, error, connect, disconnect, switchChain, signMessage]);
}

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

function getProvider(): EthereumProvider | null {
  if (typeof window === 'undefined') return null;
  const ethereum = (window as unknown as { ethereum?: EthereumProvider }).ethereum;
  return ethereum || null;
}

async function getBalance(address: string, chainId: number): Promise<string> {
  try {
    const response = await fetch(`/api/balance?address=${address}&chainId=${chainId}`);
    if (!response.ok) return '0';
    const data = await response.json();
    return data.balance || '0';
  } catch {
    return '0';
  }
}

async function getEnsData(address: string): Promise<{ name: string | null; avatar: string | null }> {
  try {
    const response = await fetch(`/api/ens/reverse?address=${address}`);
    if (!response.ok) return { name: null, avatar: null };
    const data = await response.json();
    return { name: data.name || null, avatar: data.avatar || null };
  } catch {
    return { name: null, avatar: null };
  }
}

export default useWalletConnection;

