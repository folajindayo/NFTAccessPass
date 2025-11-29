/**
 * Wallet-related type definitions
 */

import type { Address, Hash } from 'viem';

/**
 * Wallet connection status
 */
export type WalletConnectionStatus = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

/**
 * Wallet provider types
 */
export type WalletProvider = 
  | 'metamask'
  | 'coinbase'
  | 'walletconnect'
  | 'injected'
  | 'safe'
  | 'ledger'
  | 'unknown';

/**
 * Wallet connection info
 */
export interface WalletConnection {
  address: Address;
  chainId: number;
  isConnected: boolean;
  status: WalletConnectionStatus;
  provider: WalletProvider;
  connector?: string;
}

/**
 * Wallet balance
 */
export interface WalletBalance {
  address: Address;
  chainId: number;
  native: {
    symbol: string;
    decimals: number;
    balance: bigint;
    formatted: string;
    usdValue?: number;
  };
  tokens: TokenBalance[];
  totalUsdValue?: number;
}

/**
 * Token balance
 */
export interface TokenBalance {
  contractAddress: Address;
  symbol: string;
  name: string;
  decimals: number;
  balance: bigint;
  formatted: string;
  usdValue?: number;
  logoUri?: string;
}

/**
 * Wallet account with ENS
 */
export interface WalletAccount {
  address: Address;
  ensName?: string;
  ensAvatar?: string;
  displayName: string;
  shortAddress: string;
}

/**
 * Wallet configuration
 */
export interface WalletConfig {
  autoConnect: boolean;
  reconnectOnMount: boolean;
  supportedChainIds: number[];
  defaultChainId: number;
  walletConnectProjectId?: string;
}

/**
 * Wallet modal state
 */
export interface WalletModalState {
  isOpen: boolean;
  view: 'connect' | 'account' | 'network' | 'transactions';
}

/**
 * Pending transaction
 */
export interface PendingTransaction {
  hash: Hash;
  description: string;
  timestamp: number;
  chainId: number;
  status: 'pending' | 'confirmed' | 'failed';
}

/**
 * Wallet events
 */
export interface WalletEvents {
  connect: { address: Address; chainId: number };
  disconnect: undefined;
  accountChanged: { address: Address };
  chainChanged: { chainId: number };
  error: { error: Error };
}

/**
 * Sign message params
 */
export interface SignMessageParams {
  message: string | Uint8Array;
  account?: Address;
}

/**
 * Sign typed data params
 */
export interface SignTypedDataParams {
  domain: {
    name?: string;
    version?: string;
    chainId?: number;
    verifyingContract?: Address;
    salt?: Hash;
  };
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType: string;
  message: Record<string, unknown>;
}

/**
 * Wallet permission
 */
export interface WalletPermission {
  parentCapability: string;
  date?: number;
}

/**
 * Wallet session
 */
export interface WalletSession {
  address: Address;
  chainId: number;
  provider: WalletProvider;
  connectedAt: number;
  lastActiveAt: number;
  permissions: WalletPermission[];
}

/**
 * Switch chain params
 */
export interface SwitchChainParams {
  chainId: number;
}

/**
 * Add chain params
 */
export interface AddChainParams {
  chainId: number;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[];
}

/**
 * Watch asset params
 */
export interface WatchAssetParams {
  type: 'ERC20' | 'ERC721' | 'ERC1155';
  options: {
    address: Address;
    symbol: string;
    decimals?: number;
    image?: string;
    tokenId?: string;
  };
}

