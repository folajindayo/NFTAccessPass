/**
 * Chain and network-related type definitions
 */

import type { Address } from 'viem';

/**
 * Chain ID type
 */
export type ChainId = number;

/**
 * Network type
 */
export type NetworkType = 'mainnet' | 'testnet' | 'devnet' | 'local';

/**
 * Chain native currency
 */
export interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

/**
 * Block explorer config
 */
export interface BlockExplorer {
  name: string;
  url: string;
  apiUrl?: string;
  standard?: 'EIP3091' | 'none';
}

/**
 * RPC endpoint config
 */
export interface RpcEndpoint {
  url: string;
  isPublic: boolean;
  isWebSocket?: boolean;
  priority?: number;
}

/**
 * Chain configuration
 */
export interface ChainConfig {
  id: ChainId;
  name: string;
  shortName: string;
  network: string;
  networkType: NetworkType;
  nativeCurrency: NativeCurrency;
  rpcUrls: RpcEndpoint[];
  blockExplorers: BlockExplorer[];
  contracts?: ChainContracts;
  iconUrl?: string;
  testnet: boolean;
  features?: ChainFeatures;
}

/**
 * Chain contracts
 */
export interface ChainContracts {
  multicall3?: Address;
  ensRegistry?: Address;
  ensUniversalResolver?: Address;
  accessPass?: Address;
}

/**
 * Chain features
 */
export interface ChainFeatures {
  eip1559: boolean;
  eip155: boolean;
  eip2930: boolean;
  eip4844: boolean;
  supportsEns: boolean;
  supportsNFT: boolean;
  averageBlockTime: number;
}

/**
 * Chain status
 */
export interface ChainStatus {
  chainId: ChainId;
  isHealthy: boolean;
  latestBlock: number;
  gasPrice: bigint;
  baseFee?: bigint;
  lastUpdated: number;
}

/**
 * Supported chains map
 */
export type SupportedChains = Record<ChainId, ChainConfig>;

/**
 * Chain switch request
 */
export interface ChainSwitchRequest {
  chainId: ChainId;
  addChainIfMissing?: boolean;
}

/**
 * Add chain request
 */
export interface AddChainRequest {
  chainId: ChainId;
  chainName: string;
  nativeCurrency: NativeCurrency;
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[];
}

/**
 * Chain comparator
 */
export type ChainComparator = (a: ChainConfig, b: ChainConfig) => number;

/**
 * Chain filter
 */
export interface ChainFilter {
  networkType?: NetworkType;
  testnet?: boolean;
  hasFeature?: keyof ChainFeatures;
  excludeIds?: ChainId[];
}

/**
 * Bridge config
 */
export interface BridgeConfig {
  name: string;
  url: string;
  supportedChains: ChainId[];
  tokens?: Address[];
}

/**
 * Cross-chain token
 */
export interface CrossChainToken {
  symbol: string;
  name: string;
  addresses: Record<ChainId, Address>;
  decimals: Record<ChainId, number>;
}

/**
 * Chain-specific token list
 */
export interface ChainTokenList {
  chainId: ChainId;
  name: string;
  logoURI?: string;
  tokens: ChainToken[];
  timestamp: string;
  version: {
    major: number;
    minor: number;
    patch: number;
  };
}

/**
 * Chain token
 */
export interface ChainToken {
  address: Address;
  chainId: ChainId;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
}

/**
 * Chain selector option
 */
export interface ChainSelectorOption {
  chainId: ChainId;
  name: string;
  shortName: string;
  iconUrl?: string;
  disabled?: boolean;
  disabledReason?: string;
}

/**
 * Multi-chain balance
 */
export interface MultiChainBalance {
  address: Address;
  chains: Array<{
    chainId: ChainId;
    nativeBalance: bigint;
    nativeBalanceUsd?: number;
  }>;
  totalUsd?: number;
}

/**
 * Chain connection state
 */
export interface ChainConnectionState {
  chainId: ChainId;
  isConnected: boolean;
  isSupported: boolean;
  rpcLatency?: number;
  blocksBehind?: number;
}

