import { useState, useEffect, useCallback } from 'react';

export interface EnsData {
  name: string | null;
  avatar: string | null;
  records: Record<string, string>;
}

export interface UseEnsNameOptions {
  address: string | undefined;
  enabled?: boolean;
  staleTime?: number;
}

export interface UseEnsNameResult {
  ensName: string | null;
  ensAvatar: string | null;
  ensRecords: Record<string, string>;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const ensCache = new Map<string, { data: EnsData; timestamp: number }>();
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to resolve ENS name and avatar for an Ethereum address.
 * Supports caching and fetching additional ENS records.
 */
export function useEnsName({
  address,
  enabled = true,
  staleTime = DEFAULT_STALE_TIME,
}: UseEnsNameOptions): UseEnsNameResult {
  const [ensName, setEnsName] = useState<string | null>(null);
  const [ensAvatar, setEnsAvatar] = useState<string | null>(null);
  const [ensRecords, setEnsRecords] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const normalizedAddress = address?.toLowerCase();

  const fetchEnsData = useCallback(async () => {
    if (!normalizedAddress || !enabled) {
      setEnsName(null);
      setEnsAvatar(null);
      setEnsRecords({});
      return;
    }

    // Check cache
    const cached = ensCache.get(normalizedAddress);
    if (cached && Date.now() - cached.timestamp < staleTime) {
      setEnsName(cached.data.name);
      setEnsAvatar(cached.data.avatar);
      setEnsRecords(cached.data.records);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Reverse resolve address to ENS name
      const name = await resolveEnsName(normalizedAddress);
      
      let avatar: string | null = null;
      let records: Record<string, string> = {};

      if (name) {
        // Fetch avatar and other records
        const [avatarResult, recordsResult] = await Promise.all([
          fetchEnsAvatar(name),
          fetchEnsRecords(name),
        ]);

        avatar = avatarResult;
        records = recordsResult;
      }

      const data: EnsData = { name, avatar, records };
      
      // Cache the result
      ensCache.set(normalizedAddress, {
        data,
        timestamp: Date.now(),
      });

      setEnsName(name);
      setEnsAvatar(avatar);
      setEnsRecords(records);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to resolve ENS'));
    } finally {
      setLoading(false);
    }
  }, [normalizedAddress, enabled, staleTime]);

  useEffect(() => {
    fetchEnsData();
  }, [fetchEnsData]);

  return {
    ensName,
    ensAvatar,
    ensRecords,
    loading,
    error,
    refetch: fetchEnsData,
  };
}

async function resolveEnsName(address: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/ens/reverse?address=${address}`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.name || null;
  } catch {
    return null;
  }
}

async function fetchEnsAvatar(name: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/ens/avatar?name=${name}`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.avatar || null;
  } catch {
    return null;
  }
}

async function fetchEnsRecords(name: string): Promise<Record<string, string>> {
  try {
    const response = await fetch(`/api/ens/records?name=${name}`);
    
    if (!response.ok) {
      return {};
    }

    const data = await response.json();
    return data.records || {};
  } catch {
    return {};
  }
}

/**
 * Hook to resolve an address from an ENS name
 */
export function useEnsAddress(name: string | undefined): {
  address: string | null;
  loading: boolean;
  error: Error | null;
} {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!name) {
      setAddress(null);
      return;
    }

    const resolve = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/ens/resolve?name=${name}`);
        
        if (!response.ok) {
          throw new Error('Failed to resolve ENS name');
        }

        const data = await response.json();
        setAddress(data.address || null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setAddress(null);
      } finally {
        setLoading(false);
      }
    };

    resolve();
  }, [name]);

  return { address, loading, error };
}

/**
 * Format address with optional ENS name
 */
export function formatAddressWithEns(
  address: string,
  ensName: string | null,
  truncate: boolean = true
): string {
  if (ensName) {
    return ensName;
  }

  if (truncate) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return address;
}

/**
 * Clear the ENS cache
 */
export function clearEnsCache(): void {
  ensCache.clear();
}

/**
 * Invalidate a specific address from the cache
 */
export function invalidateEnsCache(address: string): void {
  ensCache.delete(address.toLowerCase());
}

export default useEnsName;

