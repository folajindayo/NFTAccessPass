/**
 * Wallet Service
 * 
 * Handles wallet-related operations including address formatting,
 * balance fetching, and connection state management.
 */

import { type Address } from 'viem';

export interface WalletInfo {
  address: Address;
  ensName?: string;
  balance: bigint;
  chainId: number;
  isConnected: boolean;
}

export interface WalletBalance {
  wei: bigint;
  ether: string;
  formatted: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  error?: Error;
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
 * @returns WalletBalance object with multiple formats
 */
export function getFormattedBalance(weiBalance: bigint): WalletBalance {
  const etherValue = formatWeiToEther(weiBalance);
  const numericValue = parseFloat(etherValue);
  
  let formatted: string;
  if (numericValue === 0) {
    formatted = '0 ETH';
  } else if (numericValue < 0.0001) {
    formatted = '< 0.0001 ETH';
  } else if (numericValue < 1) {
    formatted = `${numericValue.toFixed(4)} ETH`;
  } else if (numericValue < 1000) {
    formatted = `${numericValue.toFixed(2)} ETH`;
  } else {
    formatted = `${numericValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} ETH`;
  }

  return {
    wei: weiBalance,
    ether: etherValue,
    formatted,
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
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    5: 'https://goerli.etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    137: 'https://polygonscan.com',
    80001: 'https://mumbai.polygonscan.com',
    42161: 'https://arbiscan.io',
    10: 'https://optimistic.etherscan.io',
  };

  const baseUrl = explorers[chainId] || explorers[1];
  return `${baseUrl}/address/${address}`;
}

/**
 * Get the explorer URL for a transaction
 * @param txHash - Transaction hash
 * @param chainId - Chain ID
 * @returns Explorer URL for the transaction
 */
export function getExplorerTxUrl(txHash: string, chainId: number = 1): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    5: 'https://goerli.etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    137: 'https://polygonscan.com',
    80001: 'https://mumbai.polygonscan.com',
    42161: 'https://arbiscan.io',
    10: 'https://optimistic.etherscan.io',
  };

  const baseUrl = explorers[chainId] || explorers[1];
  return `${baseUrl}/tx/${txHash}`;
}

