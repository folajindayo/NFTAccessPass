/**
 * Viem Client Configuration
 * Centralized viem client setup
 */

import { createPublicClient, createWalletClient, http, type PublicClient, type WalletClient, type Chain } from 'viem';
import { hardhat, mainnet, sepolia, base, arbitrum, optimism } from 'viem/chains';

/**
 * Viem client type
 */
export type ViemClient = PublicClient;

/**
 * Supported chains map
 */
export const supportedChains: Record<number, Chain> = {
  1: mainnet,
  11155111: sepolia,
  8453: base,
  42161: arbitrum,
  10: optimism,
  31337: hardhat,
};

/**
 * RPC URLs per chain
 */
const rpcUrls: Record<number, string> = {
  1: process.env.NEXT_PUBLIC_MAINNET_RPC || 'https://eth.llamarpc.com',
  11155111: process.env.NEXT_PUBLIC_SEPOLIA_RPC || 'https://rpc.sepolia.org',
  8453: process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org',
  42161: process.env.NEXT_PUBLIC_ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
  10: process.env.NEXT_PUBLIC_OPTIMISM_RPC || 'https://mainnet.optimism.io',
  31337: process.env.RPC_URL || 'http://127.0.0.1:8545',
};

/**
 * Client cache
 */
const clientCache = new Map<number, PublicClient>();

/**
 * Get RPC URL for chain
 */
export function getRpcUrl(chainId: number): string {
  return rpcUrls[chainId] || rpcUrls[1];
}

/**
 * Get chain by ID
 */
export function getChain(chainId: number): Chain {
  return supportedChains[chainId] || mainnet;
}

/**
 * Create a public client for a chain
 */
export function createViemClient(chainId: number): PublicClient {
  // Check cache
  const cached = clientCache.get(chainId);
  if (cached) return cached;

  const chain = getChain(chainId);
  const rpcUrl = getRpcUrl(chainId);

  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
    batch: {
      multicall: true,
    },
  });

  // Cache the client
  clientCache.set(chainId, client);

  return client;
}

/**
 * Create wallet client (for server-side use)
 */
export function createViemWalletClient(
  chainId: number,
  account?: `0x${string}`
): WalletClient {
  const chain = getChain(chainId);
  const rpcUrl = getRpcUrl(chainId);

  return createWalletClient({
    chain,
    transport: http(rpcUrl),
    account,
  });
}

/**
 * Get public client (with default chain)
 */
export function getPublicClient(chainId: number = 1): PublicClient {
  return createViemClient(chainId);
}

/**
 * Clear client cache
 */
export function clearClientCache(): void {
  clientCache.clear();
}

/**
 * Check if chain is supported
 */
export function isChainSupported(chainId: number): boolean {
  return chainId in supportedChains;
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.keys(supportedChains).map(Number);
}

