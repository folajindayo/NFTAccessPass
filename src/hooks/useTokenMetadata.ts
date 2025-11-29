import { useState, useEffect, useCallback } from 'react';

export interface TokenAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'number' | 'boost_number' | 'boost_percentage' | 'date';
  max_value?: number;
}

export interface TokenMetadata {
  name: string;
  description?: string;
  image: string;
  externalUrl?: string;
  animationUrl?: string;
  attributes?: TokenAttribute[];
  backgroundColor?: string;
  properties?: Record<string, unknown>;
}

export interface UseTokenMetadataOptions {
  contractAddress: string;
  tokenId: string;
  chainId?: number;
  enabled?: boolean;
  staleTime?: number;
}

export interface UseTokenMetadataResult {
  metadata: TokenMetadata | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const metadataCache = new Map<string, { data: TokenMetadata; timestamp: number }>();
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to fetch NFT token metadata from tokenURI.
 * Handles IPFS URLs, caching, and metadata parsing.
 */
export function useTokenMetadata({
  contractAddress,
  tokenId,
  chainId = 1,
  enabled = true,
  staleTime = DEFAULT_STALE_TIME,
}: UseTokenMetadataOptions): UseTokenMetadataResult {
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cacheKey = `${chainId}:${contractAddress}:${tokenId}`;

  const fetchMetadata = useCallback(async () => {
    if (!contractAddress || !tokenId || !enabled) {
      return;
    }

    // Check cache first
    const cached = metadataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < staleTime) {
      setMetadata(cached.data);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, get the tokenURI from the contract
      const tokenUri = await getTokenUri(contractAddress, tokenId, chainId);
      
      if (!tokenUri) {
        throw new Error('No tokenURI found');
      }

      // Resolve the URI and fetch metadata
      const resolvedUri = resolveUri(tokenUri);
      const response = await fetch(resolvedUri);

      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }

      const rawMetadata = await response.json();
      const parsedMetadata = parseMetadata(rawMetadata);

      // Cache the result
      metadataCache.set(cacheKey, {
        data: parsedMetadata,
        timestamp: Date.now(),
      });

      setMetadata(parsedMetadata);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch metadata');
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, [contractAddress, tokenId, chainId, enabled, cacheKey, staleTime]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  return {
    metadata,
    loading,
    error,
    refetch: fetchMetadata,
  };
}

async function getTokenUri(
  contractAddress: string,
  tokenId: string,
  chainId: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `/api/nft/tokenUri?contract=${contractAddress}&tokenId=${tokenId}&chainId=${chainId}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.tokenUri || null;
  } catch {
    return null;
  }
}

function resolveUri(uri: string): string {
  // Handle IPFS URIs
  if (uri.startsWith('ipfs://')) {
    const hash = uri.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${hash}`;
  }

  // Handle Arweave URIs
  if (uri.startsWith('ar://')) {
    const hash = uri.replace('ar://', '');
    return `https://arweave.net/${hash}`;
  }

  // Handle data URIs (base64 encoded JSON)
  if (uri.startsWith('data:application/json;base64,')) {
    return uri; // Will be handled in fetch
  }

  // Return as-is for http(s) URIs
  return uri;
}

function parseMetadata(raw: Record<string, unknown>): TokenMetadata {
  // Handle base64 encoded data URIs
  if (typeof raw === 'string' && raw.startsWith('data:application/json;base64,')) {
    const base64 = raw.replace('data:application/json;base64,', '');
    const decoded = atob(base64);
    raw = JSON.parse(decoded);
  }

  return {
    name: String(raw.name || 'Unnamed'),
    description: raw.description ? String(raw.description) : undefined,
    image: resolveUri(String(raw.image || raw.image_url || '')),
    externalUrl: raw.external_url ? String(raw.external_url) : undefined,
    animationUrl: raw.animation_url ? resolveUri(String(raw.animation_url)) : undefined,
    attributes: parseAttributes(raw.attributes),
    backgroundColor: raw.background_color ? String(raw.background_color) : undefined,
    properties: raw.properties as Record<string, unknown> | undefined,
  };
}

function parseAttributes(attributes: unknown): TokenAttribute[] | undefined {
  if (!Array.isArray(attributes)) {
    return undefined;
  }

  return attributes
    .filter((attr): attr is Record<string, unknown> => 
      typeof attr === 'object' && attr !== null
    )
    .map((attr) => ({
      trait_type: String(attr.trait_type || 'Unknown'),
      value: attr.value as string | number,
      display_type: attr.display_type as TokenAttribute['display_type'],
      max_value: typeof attr.max_value === 'number' ? attr.max_value : undefined,
    }));
}

/**
 * Clear the metadata cache
 */
export function clearMetadataCache(): void {
  metadataCache.clear();
}

/**
 * Remove a specific entry from the cache
 */
export function invalidateMetadata(
  contractAddress: string,
  tokenId: string,
  chainId: number = 1
): void {
  const cacheKey = `${chainId}:${contractAddress}:${tokenId}`;
  metadataCache.delete(cacheKey);
}

export default useTokenMetadata;

