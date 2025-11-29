import { useState, useEffect, useCallback } from 'react';

export interface ChainInfo {
  chainId: number;
  name: string;
  shortName: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorers: { name: string; url: string }[];
  isTestnet: boolean;
}

export interface UseChainIdOptions {
  targetChainId?: number;
  autoSwitch?: boolean;
  enabled?: boolean;
}

export interface UseChainIdResult {
  chainId: number | null;
  chainInfo: ChainInfo | null;
  isCorrectChain: boolean;
  isSupported: boolean;
  loading: boolean;
  error: Error | null;
  switchChain: (targetChainId: number) => Promise<boolean>;
  addChain: (chainInfo: ChainInfo) => Promise<boolean>;
}

const supportedChains: Record<number, ChainInfo> = {
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    shortName: 'ETH',
    currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://eth.llamarpc.com'],
    blockExplorers: [{ name: 'Etherscan', url: 'https://etherscan.io' }],
    isTestnet: false,
  },
  11155111: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    shortName: 'SEP',
    currency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorers: [{ name: 'Etherscan', url: 'https://sepolia.etherscan.io' }],
    isTestnet: true,
  },
  137: {
    chainId: 137,
    name: 'Polygon Mainnet',
    shortName: 'MATIC',
    currency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorers: [{ name: 'PolygonScan', url: 'https://polygonscan.com' }],
    isTestnet: false,
  },
  42161: {
    chainId: 42161,
    name: 'Arbitrum One',
    shortName: 'ARB',
    currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorers: [{ name: 'Arbiscan', url: 'https://arbiscan.io' }],
    isTestnet: false,
  },
  8453: {
    chainId: 8453,
    name: 'Base',
    shortName: 'BASE',
    currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorers: [{ name: 'BaseScan', url: 'https://basescan.org' }],
    isTestnet: false,
  },
  84532: {
    chainId: 84532,
    name: 'Base Sepolia',
    shortName: 'BSEP',
    currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorers: [{ name: 'BaseScan', url: 'https://sepolia.basescan.org' }],
    isTestnet: true,
  },
};

/**
 * Hook to detect and manage the current chain ID.
 * Supports chain switching and adding new chains.
 */
export function useChainId({
  targetChainId,
  autoSwitch = false,
  enabled = true,
}: UseChainIdOptions = {}): UseChainIdResult {
  const [chainId, setChainId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const chainInfo = chainId ? supportedChains[chainId] || null : null;
  const isSupported = chainId ? chainId in supportedChains : false;
  const isCorrectChain = targetChainId ? chainId === targetChainId : true;

  // Get current chain ID
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const getChainId = async () => {
      const provider = getProvider();
      if (!provider) return;

      try {
        const chainIdHex = await provider.request({ method: 'eth_chainId' }) as string;
        const numericChainId = parseInt(chainIdHex, 16);
        setChainId(numericChainId);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to get chain ID'));
      }
    };

    getChainId();

    // Listen for chain changes
    const provider = getProvider();
    if (provider) {
      const handleChainChanged = (chainIdHex: string) => {
        setChainId(parseInt(chainIdHex, 16));
      };

      provider.on('chainChanged', handleChainChanged);
      return () => provider.removeListener('chainChanged', handleChainChanged);
    }
  }, [enabled]);

  // Auto switch to target chain
  useEffect(() => {
    if (autoSwitch && targetChainId && chainId && chainId !== targetChainId) {
      switchChain(targetChainId);
    }
  }, [autoSwitch, targetChainId, chainId]);

  const switchChain = useCallback(async (targetId: number): Promise<boolean> => {
    const provider = getProvider();
    if (!provider) {
      setError(new Error('No wallet provider found'));
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetId.toString(16)}` }],
      });
      return true;
    } catch (err: unknown) {
      const switchError = err as { code?: number };
      
      // Chain not added to wallet - try to add it
      if (switchError.code === 4902) {
        const chainToAdd = supportedChains[targetId];
        if (chainToAdd) {
          return addChain(chainToAdd);
        }
      }

      setError(err instanceof Error ? err : new Error('Failed to switch chain'));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const addChain = useCallback(async (chain: ChainInfo): Promise<boolean> => {
    const provider = getProvider();
    if (!provider) {
      setError(new Error('No wallet provider found'));
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${chain.chainId.toString(16)}`,
          chainName: chain.name,
          nativeCurrency: chain.currency,
          rpcUrls: chain.rpcUrls,
          blockExplorerUrls: chain.blockExplorers.map(e => e.url),
        }],
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add chain'));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    chainId,
    chainInfo,
    isCorrectChain,
    isSupported,
    loading,
    error,
    switchChain,
    addChain,
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

/**
 * Get chain info by chain ID
 */
export function getChainInfo(chainId: number): ChainInfo | null {
  return supportedChains[chainId] || null;
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.keys(supportedChains).map(Number);
}

export default useChainId;

