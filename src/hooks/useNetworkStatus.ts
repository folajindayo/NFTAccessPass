import { useState, useEffect, useCallback } from 'react';
import { useAccount, useChainId, useChains, useSwitchChain } from 'wagmi';

interface NetworkStatus {
  isConnected: boolean;
  isOnline: boolean;
  chainId: number | undefined;
  chainName: string | undefined;
  isSupported: boolean;
  isSwitching: boolean;
}

/**
 * Hook for monitoring network status
 */
export function useNetworkStatus(): NetworkStatus {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const chains = useChains();
  const { isPending: isSwitching } = useSwitchChain();
  const [isOnline, setIsOnline] = useState(true);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const currentChain = chains.find(c => c.id === chainId);
  const isSupported = !!currentChain;

  return {
    isConnected,
    isOnline,
    chainId,
    chainName: currentChain?.name,
    isSupported,
    isSwitching,
  };
}

/**
 * Hook for switching networks
 */
export function useNetworkSwitch() {
  const { switchChain, isPending, error, chains } = useSwitchChain();
  const chainId = useChainId();

  const switchTo = useCallback(
    (targetChainId: number) => {
      if (targetChainId !== chainId) {
        switchChain({ chainId: targetChainId });
      }
    },
    [chainId, switchChain]
  );

  const switchToDefault = useCallback(() => {
    const defaultChain = chains[0];
    if (defaultChain && defaultChain.id !== chainId) {
      switchChain({ chainId: defaultChain.id });
    }
  }, [chains, chainId, switchChain]);

  return {
    switchTo,
    switchToDefault,
    isPending,
    error,
    supportedChains: chains,
    currentChainId: chainId,
  };
}

/**
 * Hook for requiring a specific network
 */
export function useRequireNetwork(requiredChainId: number): {
  isCorrectNetwork: boolean;
  switchToRequired: () => void;
  isPending: boolean;
  error: Error | null;
} {
  const chainId = useChainId();
  const { switchChain, isPending, error } = useSwitchChain();

  const isCorrectNetwork = chainId === requiredChainId;

  const switchToRequired = useCallback(() => {
    if (!isCorrectNetwork) {
      switchChain({ chainId: requiredChainId });
    }
  }, [isCorrectNetwork, requiredChainId, switchChain]);

  return {
    isCorrectNetwork,
    switchToRequired,
    isPending,
    error: error as Error | null,
  };
}

/**
 * Hook for detecting network changes
 */
export function useOnNetworkChange(callback: (chainId: number) => void) {
  const chainId = useChainId();

  useEffect(() => {
    if (chainId) {
      callback(chainId);
    }
  }, [chainId, callback]);
}

export default useNetworkStatus;

