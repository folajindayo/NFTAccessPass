import { useState, useCallback, useEffect } from 'react';
import { useAsync } from './useAsync';

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  animation_url?: string;
}

interface UseNFTMetadataReturn {
  metadata: NFTMetadata | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Fetch NFT metadata from a URI
 */
async function fetchMetadata(uri: string): Promise<NFTMetadata> {
  // Handle IPFS URIs
  let fetchUrl = uri;
  if (uri.startsWith('ipfs://')) {
    fetchUrl = `https://ipfs.io/ipfs/${uri.slice(7)}`;
  }
  
  const response = await fetch(fetchUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Hook for fetching NFT metadata
 * @param tokenUri - The token URI to fetch metadata from
 */
export function useNFTMetadata(tokenUri?: string): UseNFTMetadataReturn {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const { execute, isLoading, error, reset } = useAsync(fetchMetadata);

  const refetch = useCallback(async () => {
    if (!tokenUri) return;
    reset();
    const result = await execute(tokenUri);
    if (result) {
      setMetadata(result);
    }
  }, [tokenUri, execute, reset]);

  useEffect(() => {
    if (tokenUri) {
      refetch();
    }
  }, [tokenUri, refetch]);

  return { metadata, isLoading, error, refetch };
}

/**
 * Hook for fetching multiple NFT metadata
 */
export function useMultipleNFTMetadata(tokenUris: string[]): {
  metadata: (NFTMetadata | null)[];
  isLoading: boolean;
  errors: (Error | null)[];
  refetch: () => Promise<void>;
} {
  const [metadata, setMetadata] = useState<(NFTMetadata | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<(Error | null)[]>([]);

  const refetch = useCallback(async () => {
    if (tokenUris.length === 0) return;
    
    setIsLoading(true);
    setErrors([]);

    const results = await Promise.allSettled(
      tokenUris.map(uri => fetchMetadata(uri))
    );

    const newMetadata: (NFTMetadata | null)[] = [];
    const newErrors: (Error | null)[] = [];

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        newMetadata.push(result.value);
        newErrors.push(null);
      } else {
        newMetadata.push(null);
        newErrors.push(result.reason instanceof Error ? result.reason : new Error(String(result.reason)));
      }
    });

    setMetadata(newMetadata);
    setErrors(newErrors);
    setIsLoading(false);
  }, [tokenUris]);

  useEffect(() => {
    refetch();
  }, [tokenUris.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return { metadata, isLoading, errors, refetch };
}

/**
 * Transform IPFS image URLs to HTTP
 */
export function resolveIPFSUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${url.slice(7)}`;
  }
  return url;
}

export default useNFTMetadata;

