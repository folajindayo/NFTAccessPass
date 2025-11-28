/**
 * Formatting utilities for display
 */

import { formatEther, formatUnits } from 'viem';

/**
 * Truncates an Ethereum address for display
 */
export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Formats a wallet address with optional ENS fallback
 */
export function formatWalletAddress(address: string, ensName?: string | null): string {
  if (ensName) return ensName;
  return truncateAddress(address);
}

/**
 * Formats a transaction hash for display
 */
export function formatTxHash(hash: string, chars = 8): string {
  if (!hash) return '';
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

/**
 * Formats ETH balance with symbol
 */
export function formatEthBalance(
  balance: bigint | string | undefined,
  decimals = 4
): string {
  if (!balance) return '0 ETH';
  const value = typeof balance === 'string' ? BigInt(balance) : balance;
  const formatted = parseFloat(formatEther(value)).toFixed(decimals);
  return `${formatted} ETH`;
}

/**
 * Formats token balance with symbol
 */
export function formatTokenBalance(
  balance: bigint | string | undefined,
  symbol: string,
  tokenDecimals = 18,
  displayDecimals = 4
): string {
  if (!balance) return `0 ${symbol}`;
  const value = typeof balance === 'string' ? BigInt(balance) : balance;
  const formatted = parseFloat(formatUnits(value, tokenDecimals)).toFixed(displayDecimals);
  return `${formatted} ${symbol}`;
}

/**
 * Formats a number with thousands separators
 */
export function formatNumber(
  value: number | string,
  decimals?: number
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  
  const options: Intl.NumberFormatOptions = decimals !== undefined
    ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
    : {};
  
  return num.toLocaleString('en-US', options);
}

/**
 * Formats a number in compact notation (e.g., 1.2K)
 */
export function formatCompactNumber(value: number): string {
  if (isNaN(value)) return '0';
  
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Formats currency value
 */
export function formatCurrency(
  value: number,
  currency = 'USD',
  decimals = 2
): string {
  if (isNaN(value)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formats percentage
 */
export function formatPercentage(value: number, decimals = 2): string {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats percentage change with sign
 */
export function formatPercentageChange(value: number, decimals = 2): string {
  if (isNaN(value)) return '0%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Formats gas price in Gwei
 */
export function formatGasPrice(gwei: number | bigint): string {
  const value = typeof gwei === 'bigint' ? Number(gwei) : gwei;
  return `${value.toFixed(2)} Gwei`;
}

/**
 * Formats file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${size.toFixed(i === 0 ? 0 : 2)} ${sizes[i]}`;
}

/**
 * Formats duration in human-readable form
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return '0s';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

/**
 * Formats relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | number | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const diffMs = Date.now() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Formats a date in a standard format
 */
export function formatDate(date: Date | number | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a timestamp
 */
export function formatTimestamp(date: Date | number | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats block number with commas
 */
export function formatBlockNumber(block: number | bigint): string {
  return Number(block).toLocaleString('en-US');
}

/**
 * Formats token ID
 */
export function formatTokenId(tokenId: number | bigint | string): string {
  return `#${tokenId}`;
}

/**
 * Formats NFT collection name
 */
export function formatCollectionName(name: string, maxLength = 20): string {
  if (!name) return '';
  if (name.length <= maxLength) return name;
  return `${name.slice(0, maxLength)}...`;
}

/**
 * Formats status badge text
 */
export function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, ' ');
}

export default {
  truncateAddress,
  formatWalletAddress,
  formatTxHash,
  formatEthBalance,
  formatTokenBalance,
  formatNumber,
  formatCompactNumber,
  formatCurrency,
  formatPercentage,
  formatPercentageChange,
  formatGasPrice,
  formatFileSize,
  formatDuration,
  formatRelativeTime,
  formatDate,
  formatTimestamp,
  formatBlockNumber,
  formatTokenId,
  formatCollectionName,
  formatStatus,
};
