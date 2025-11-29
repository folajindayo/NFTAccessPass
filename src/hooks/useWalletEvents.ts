import { useState, useEffect, useCallback, useRef } from 'react';

export type WalletEventType =
  | 'accountsChanged'
  | 'chainChanged'
  | 'connect'
  | 'disconnect'
  | 'message';

export interface WalletEventData {
  type: WalletEventType;
  timestamp: number;
  data: unknown;
}

export interface AccountsChangedEvent {
  accounts: string[];
  previousAccounts: string[];
}

export interface ChainChangedEvent {
  chainId: number;
  previousChainId: number;
}

export interface ConnectEvent {
  chainId: number;
}

export interface DisconnectEvent {
  error?: Error;
}

export interface UseWalletEventsOptions {
  onAccountsChanged?: (event: AccountsChangedEvent) => void;
  onChainChanged?: (event: ChainChangedEvent) => void;
  onConnect?: (event: ConnectEvent) => void;
  onDisconnect?: (event: DisconnectEvent) => void;
  enabled?: boolean;
}

export interface UseWalletEventsResult {
  currentAccount: string | null;
  currentChainId: number | null;
  isConnected: boolean;
  lastEvent: WalletEventData | null;
  eventHistory: WalletEventData[];
  clearHistory: () => void;
}

const MAX_HISTORY_LENGTH = 50;

/**
 * Hook to listen for wallet provider events.
 * Tracks account changes, chain changes, connect, and disconnect events.
 */
export function useWalletEvents({
  onAccountsChanged,
  onChainChanged,
  onConnect,
  onDisconnect,
  enabled = true,
}: UseWalletEventsOptions = {}): UseWalletEventsResult {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WalletEventData | null>(null);
  const [eventHistory, setEventHistory] = useState<WalletEventData[]>([]);

  const previousAccountRef = useRef<string | null>(null);
  const previousChainIdRef = useRef<number | null>(null);

  const addEvent = useCallback((type: WalletEventType, data: unknown) => {
    const event: WalletEventData = {
      type,
      timestamp: Date.now(),
      data,
    };

    setLastEvent(event);
    setEventHistory(prev => {
      const updated = [event, ...prev];
      return updated.slice(0, MAX_HISTORY_LENGTH);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setEventHistory([]);
    setLastEvent(null);
  }, []);

  // Get initial state
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const provider = getProvider();
    if (!provider) return;

    const initState = async () => {
      try {
        const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
        const chainId = await provider.request({ method: 'eth_chainId' }) as string;

        if (accounts.length > 0) {
          setCurrentAccount(accounts[0]);
          previousAccountRef.current = accounts[0];
          setIsConnected(true);
        }

        const numericChainId = parseInt(chainId, 16);
        setCurrentChainId(numericChainId);
        previousChainIdRef.current = numericChainId;
      } catch (err) {
        console.error('Failed to get initial wallet state:', err);
      }
    };

    initState();
  }, [enabled]);

  // Set up event listeners
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const provider = getProvider();
    if (!provider) return;

    const handleAccountsChanged = (accounts: string[]) => {
      const previousAccounts = previousAccountRef.current ? [previousAccountRef.current] : [];
      const newAccount = accounts[0] || null;

      setCurrentAccount(newAccount);
      setIsConnected(accounts.length > 0);

      const eventData: AccountsChangedEvent = {
        accounts,
        previousAccounts,
      };

      addEvent('accountsChanged', eventData);
      onAccountsChanged?.(eventData);

      previousAccountRef.current = newAccount;
    };

    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = parseInt(chainIdHex, 16);
      const previousChainId = previousChainIdRef.current || 0;

      setCurrentChainId(newChainId);

      const eventData: ChainChangedEvent = {
        chainId: newChainId,
        previousChainId,
      };

      addEvent('chainChanged', eventData);
      onChainChanged?.(eventData);

      previousChainIdRef.current = newChainId;
    };

    const handleConnect = (info: { chainId: string }) => {
      const chainId = parseInt(info.chainId, 16);
      setCurrentChainId(chainId);
      setIsConnected(true);

      const eventData: ConnectEvent = { chainId };
      addEvent('connect', eventData);
      onConnect?.(eventData);
    };

    const handleDisconnect = (error?: Error) => {
      setCurrentAccount(null);
      setIsConnected(false);

      const eventData: DisconnectEvent = { error };
      addEvent('disconnect', eventData);
      onDisconnect?.(eventData);

      previousAccountRef.current = null;
    };

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);
    provider.on('connect', handleConnect);
    provider.on('disconnect', handleDisconnect);

    return () => {
      provider.removeListener('accountsChanged', handleAccountsChanged);
      provider.removeListener('chainChanged', handleChainChanged);
      provider.removeListener('connect', handleConnect);
      provider.removeListener('disconnect', handleDisconnect);
    };
  }, [enabled, onAccountsChanged, onChainChanged, onConnect, onDisconnect, addEvent]);

  return {
    currentAccount,
    currentChainId,
    isConnected,
    lastEvent,
    eventHistory,
    clearHistory,
  };
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

export default useWalletEvents;

