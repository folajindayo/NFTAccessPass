/**
 * React Query Configuration
 * Centralized query client setup
 */

import { QueryClient, QueryClientConfig } from '@tanstack/react-query';

/**
 * Default query client configuration
 */
export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // Stale time (data considered fresh for this long)
      staleTime: 1000 * 60, // 1 minute
      
      // Cache time (how long to keep inactive data)
      gcTime: 1000 * 60 * 5, // 5 minutes
      
      // Retry configuration
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus (disabled for better UX)
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Network mode
      networkMode: 'online',
    },
    mutations: {
      // Mutation retry configuration
      retry: 1,
      retryDelay: 1000,
      
      // Network mode
      networkMode: 'online',
    },
  },
};

/**
 * Create query client instance
 */
export function createQueryClient(): QueryClient {
  return new QueryClient(queryClientConfig);
}

/**
 * Singleton query client
 */
export const queryClient = createQueryClient();

/**
 * Prefetch a query
 */
export async function prefetchQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
}

/**
 * Invalidate queries by key
 */
export async function invalidateQueries(queryKey: string[]): Promise<void> {
  await queryClient.invalidateQueries({ queryKey });
}

/**
 * Clear all queries
 */
export function clearQueries(): void {
  queryClient.clear();
}

/**
 * Get cached query data
 */
export function getQueryData<T>(queryKey: string[]): T | undefined {
  return queryClient.getQueryData<T>(queryKey);
}

/**
 * Set query data directly
 */
export function setQueryData<T>(queryKey: string[], data: T): void {
  queryClient.setQueryData(queryKey, data);
}

/**
 * Query key factory for consistent key generation
 */
export const queryKeys = {
  // Access queries
  access: {
    all: ['access'] as const,
    check: (address: string) => ['access', 'check', address] as const,
    balance: (address: string) => ['access', 'balance', address] as const,
  },
  
  // NFT queries
  nft: {
    all: ['nft'] as const,
    owned: (address: string) => ['nft', 'owned', address] as const,
    metadata: (contractAddress: string, tokenId: string) => 
      ['nft', 'metadata', contractAddress, tokenId] as const,
  },
  
  // Transaction queries
  transaction: {
    all: ['transaction'] as const,
    history: (address: string) => ['transaction', 'history', address] as const,
    receipt: (hash: string) => ['transaction', 'receipt', hash] as const,
  },
  
  // Gas queries
  gas: {
    all: ['gas'] as const,
    price: (chainId: number) => ['gas', 'price', chainId] as const,
  },
  
  // ENS queries
  ens: {
    all: ['ens'] as const,
    name: (address: string) => ['ens', 'name', address] as const,
    avatar: (name: string) => ['ens', 'avatar', name] as const,
  },
} as const;

