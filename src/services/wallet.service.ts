/**
 * Wallet Service
 * 
 * Handles wallet-related operations including address formatting,
 * balance fetching, and connection state management with multi-chain support.
 */

import { type Address } from 'viem';

export interface WalletInfo {
  address: Address;
  ensName?: string;
  ensAvatar?: string;
  balance: bigint;
  chainId: number;
  chainName: string;
  isConnected: boolean;
}

export interface WalletBalance {
  wei: bigint;
  ether: string;
  formatted: string;
  symbol: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  isReconnecting: boolean;
  error?: Error;
}

export interface ChainConfig {
  id: number;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorers: { name: string; url: string }[];
  isTestnet: boolean;
}

/**
 * Supported chain configurations
 */
export const CHAIN_CONFIGS: Record<number, ChainConfig> = {
  1: {
    id: 1,
    name: 'Ethereum Mainnet',
    shortName: 'ETH',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://eth.llamarpc.com'],
    blockExplorers: [{ name: 'Etherscan', url: 'https://etherscan.io' }],
    isTestnet: false,
  },
  11155111: {
    id: 11155111,
    name: 'Sepolia Testnet',
    shortName: 'SEP',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorers: [{ name: 'Etherscan', url: 'https://sepolia.etherscan.io' }],
    isTestnet: true,
  },
  137: {
    id: 137,
    name: 'Polygon',
    shortName: 'MATIC',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorers: [{ name: 'PolygonScan', url: 'https://polygonscan.com' }],
    isTestnet: false,
  },
  42161: {
    id: 42161,
    name: 'Arbitrum One',
    shortName: 'ARB',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorers: [{ name: 'Arbiscan', url: 'https://arbiscan.io' }],
    isTestnet: false,
  },
  10: {
    id: 10,
    name: 'Optimism',
    shortName: 'OP',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.optimism.io'],
    blockExplorers: [{ name: 'Optimism Explorer', url: 'https://optimistic.etherscan.io' }],
    isTestnet: false,
  },
  8453: {
    id: 8453,
    name: 'Base',
    shortName: 'BASE',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorers: [{ name: 'BaseScan', url: 'https://basescan.org' }],
    isTestnet: false,
  },
  84532: {
    id: 84532,
    name: 'Base Sepolia',
    shortName: 'BSEP',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorers: [{ name: 'BaseScan', url: 'https://sepolia.basescan.org' }],
    isTestnet: true,
  },
  56: {
    id: 56,
    name: 'BNB Smart Chain',
    shortName: 'BNB',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorers: [{ name: 'BscScan', url: 'https://bscscan.com' }],
    isTestnet: false,
  },
  43114: {
    id: 43114,
    name: 'Avalanche',
    shortName: 'AVAX',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorers: [{ name: 'SnowTrace', url: 'https://snowtrace.io' }],
    isTestnet: false,
  },
};

/**
 * Get chain configuration by ID
 */
export function getChainConfig(chainId: number): ChainConfig | null {
  return CHAIN_CONFIGS[chainId] || null;
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.keys(CHAIN_CONFIGS).map(Number);
}

/**
 * Get native currency symbol for a chain
 */
export function getNativeCurrencySymbol(chainId: number): string {
  return CHAIN_CONFIGS[chainId]?.nativeCurrency.symbol || 'ETH';
}

/**
 * Check if chain is a testnet
 */
export function isTestnet(chainId: number): boolean {
  return CHAIN_CONFIGS[chainId]?.isTestnet || false;
}

/**
 * Truncate an Ethereum address for display
 * @param address - Full Ethereum address
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Truncated address string
 */
export function truncateAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (!address || address.length < startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format Wei to Ether with specified decimal places
 * @param wei - Amount in Wei
 * @param decimals - Number of decimal places (default: 4)
 * @returns Formatted ether string
 */
export function formatWeiToEther(wei: bigint, decimals: number = 4): string {
  const ether = Number(wei) / 1e18;
  return ether.toFixed(decimals);
}

/**
 * Parse Ether string to Wei
 * @param ether - Amount in Ether as string
 * @returns Amount in Wei as bigint
 */
export function parseEtherToWei(ether: string): bigint {
  const etherFloat = parseFloat(ether);
  if (isNaN(etherFloat)) {
    throw new Error('Invalid ether amount');
  }
  return BigInt(Math.floor(etherFloat * 1e18));
}

/**
 * Get wallet balance with multiple formats
 * @param weiBalance - Balance in Wei
 * @param chainId - Chain ID for symbol (default: 1)
 * @returns WalletBalance object with multiple formats
 */
export function getFormattedBalance(weiBalance: bigint, chainId: number = 1): WalletBalance {
  const symbol = getNativeCurrencySymbol(chainId);
  const etherValue = formatWeiToEther(weiBalance);
  const numericValue = parseFloat(etherValue);
  
  let formatted: string;
  if (numericValue === 0) {
    formatted = `0 ${symbol}`;
  } else if (numericValue < 0.0001) {
    formatted = `< 0.0001 ${symbol}`;
  } else if (numericValue < 1) {
    formatted = `${numericValue.toFixed(4)} ${symbol}`;
  } else if (numericValue < 1000) {
    formatted = `${numericValue.toFixed(2)} ${symbol}`;
  } else {
    formatted = `${numericValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${symbol}`;
  }

  return {
    wei: weiBalance,
    ether: etherValue,
    formatted,
    symbol,
  };
}

/**
 * Validate if a string is a valid Ethereum address
 * @param address - String to validate
 * @returns Boolean indicating if valid
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Get checksum address from a lowercase address
 * @param address - Ethereum address
 * @returns Checksummed address or original if invalid
 */
export function toChecksumAddress(address: string): string {
  if (!isValidEthereumAddress(address)) {
    return address;
  }
  
  // Simple checksum implementation
  const lowerAddress = address.toLowerCase().replace('0x', '');
  return '0x' + lowerAddress
    .split('')
    .map((char, i) => {
      if (parseInt(char, 16) >= 8) {
        return char.toUpperCase();
      }
      return char;
    })
    .join('');
}

/**
 * Get the explorer URL for an address
 * @param address - Ethereum address
 * @param chainId - Chain ID (1 for mainnet, etc.)
 * @returns Explorer URL
 */
export function getExplorerAddressUrl(address: string, chainId: number = 1): string {
  const config = CHAIN_CONFIGS[chainId];
  const baseUrl = config?.blockExplorers[0]?.url || 'https://etherscan.io';
  return `${baseUrl}/address/${address}`;
}

/**
 * Get the explorer URL for a transaction
 * @param txHash - Transaction hash
 * @param chainId - Chain ID
 * @returns Explorer URL for the transaction
 */
export function getExplorerTxUrl(txHash: string, chainId: number = 1): string {
  const config = CHAIN_CONFIGS[chainId];
  const baseUrl = config?.blockExplorers[0]?.url || 'https://etherscan.io';
  return `${baseUrl}/tx/${txHash}`;
}

/**
 * Get the explorer URL for a token
 * @param tokenAddress - Token contract address
 * @param chainId - Chain ID
 * @returns Explorer URL for the token
 */
export function getExplorerTokenUrl(tokenAddress: string, chainId: number = 1): string {
  const config = CHAIN_CONFIGS[chainId];
  const baseUrl = config?.blockExplorers[0]?.url || 'https://etherscan.io';
  return `${baseUrl}/token/${tokenAddress}`;
}

/**
 * Get the explorer URL for a block
 * @param blockNumber - Block number
 * @param chainId - Chain ID
 * @returns Explorer URL for the block
 */
export function getExplorerBlockUrl(blockNumber: number, chainId: number = 1): string {
  const config = CHAIN_CONFIGS[chainId];
  const baseUrl = config?.blockExplorers[0]?.url || 'https://etherscan.io';
  return `${baseUrl}/block/${blockNumber}`;
}

/**
 * Compare two addresses (case-insensitive)
 */
export function addressEquals(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * Get short chain name
 */
export function getShortChainName(chainId: number): string {
  return CHAIN_CONFIGS[chainId]?.shortName || 'ETH';
}

/**
 * Get full chain name
 */
export function getChainName(chainId: number): string {
  return CHAIN_CONFIGS[chainId]?.name || 'Unknown Network';
}

/**
 * Format balance with custom decimals (for non-18 decimal tokens)
 */
export function formatTokenBalance(
  balance: bigint,
  decimals: number,
  displayDecimals: number = 4
): string {
  const divisor = BigInt(10 ** decimals);
  const whole = balance / divisor;
  const fractional = balance % divisor;
  
  if (fractional === 0n) {
    return whole.toString();
  }

  const fractionalStr = fractional.toString().padStart(decimals, '0');
  const trimmed = fractionalStr.slice(0, displayDecimals).replace(/0+$/, '');
  
  if (trimmed === '') {
    return whole.toString();
  }

  return `${whole}.${trimmed}`;
}

/**
 * Create WalletInfo object from connection data
 */
export function createWalletInfo(
  address: Address,
  chainId: number,
  balance: bigint = 0n,
  ensName?: string,
  ensAvatar?: string
): WalletInfo {
  return {
    address,
    ensName,
    ensAvatar,
    balance,
    chainId,
    chainName: getChainName(chainId),
    isConnected: true,
  };
}

/**
 * Get empty wallet info (disconnected state)
 */
export function getEmptyWalletInfo(): Omit<WalletInfo, 'address'> {
  return {
    balance: 0n,
    chainId: 1,
    chainName: 'Ethereum Mainnet',
    isConnected: false,
  };
}

