import { useState, useEffect, useCallback } from 'react';

export interface NFTOwnershipResult {
  isOwner: boolean;
  tokenIds: string[];
  balance: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseNFTOwnershipOptions {
  contractAddress: string;
  ownerAddress: string | undefined;
  chainId?: number;
  enabled?: boolean;
}

/**
 * Hook to check NFT ownership for a given wallet address.
 * Verifies if the address owns any tokens from the specified contract.
 */
export function useNFTOwnership({
  contractAddress,
  ownerAddress,
  chainId = 1,
  enabled = true,
}: UseNFTOwnershipOptions): NFTOwnershipResult {
  const [isOwner, setIsOwner] = useState(false);
  const [tokenIds, setTokenIds] = useState<string[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkOwnership = useCallback(async () => {
    if (!ownerAddress || !contractAddress || !enabled) {
      setIsOwner(false);
      setTokenIds([]);
      setBalance(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call to check ownership
      // In production, this would call an indexer API like Alchemy or Moralis
      const response = await fetchNFTsForOwner(contractAddress, ownerAddress, chainId);
      
      setIsOwner(response.ownedNfts.length > 0);
      setTokenIds(response.ownedNfts.map(nft => nft.tokenId));
      setBalance(response.totalCount);
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Failed to check ownership');
      setError(errorMessage);
      setIsOwner(false);
      setTokenIds([]);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [contractAddress, ownerAddress, chainId, enabled]);

  useEffect(() => {
    checkOwnership();
  }, [checkOwnership]);

  return {
    isOwner,
    tokenIds,
    balance,
    loading,
    error,
    refetch: checkOwnership,
  };
}

interface NFTResponse {
  ownedNfts: Array<{ tokenId: string; tokenType: string }>;
  totalCount: number;
}

async function fetchNFTsForOwner(
  contractAddress: string,
  ownerAddress: string,
  chainId: number
): Promise<NFTResponse> {
  // This is a placeholder implementation
  // In production, integrate with Alchemy, Moralis, or similar API
  const apiEndpoint = getApiEndpoint(chainId);
  
  const response = await fetch(
    `${apiEndpoint}/getNFTsForOwner?owner=${ownerAddress}&contractAddresses[]=${contractAddress}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch NFTs: ${response.statusText}`);
  }

  return response.json();
}

function getApiEndpoint(chainId: number): string {
  const endpoints: Record<number, string> = {
    1: '/api/nft/ethereum',
    137: '/api/nft/polygon',
    42161: '/api/nft/arbitrum',
    10: '/api/nft/optimism',
    8453: '/api/nft/base',
  };

  return endpoints[chainId] || '/api/nft/ethereum';
}

/**
 * Helper hook to check ownership of a specific token ID
 */
export function useTokenOwnership(
  contractAddress: string,
  tokenId: string,
  ownerAddress: string | undefined
): { isOwner: boolean; loading: boolean; error: Error | null } {
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ownerAddress || !contractAddress || !tokenId) {
      setIsOwner(false);
      return;
    }

    const checkTokenOwnership = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/nft/ownerOf?contract=${contractAddress}&tokenId=${tokenId}`
        );

        if (!response.ok) {
          throw new Error('Failed to check token ownership');
        }

        const data = await response.json();
        setIsOwner(data.owner?.toLowerCase() === ownerAddress.toLowerCase());
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsOwner(false);
      } finally {
        setLoading(false);
      }
    };

    checkTokenOwnership();
  }, [contractAddress, tokenId, ownerAddress]);

  return { isOwner, loading, error };
}

export default useNFTOwnership;

