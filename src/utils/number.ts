/**
 * Number formatting and manipulation utilities
 */

import { formatEther, formatUnits, parseEther, parseUnits } from 'viem';

/**
 * Formats a number with thousands separators
 */
export function formatWithCommas(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US');
}

/**
 * Formats a bigint value as ETH with specified decimals
 */
export function formatEthValue(
  value: bigint | string | undefined,
  decimals = 4
): string {
  if (!value) return '0';
  const wei = typeof value === 'string' ? BigInt(value) : value;
  const eth = formatEther(wei);
  return parseFloat(eth).toFixed(decimals);
}

/**
 * Formats a bigint value with custom decimals
 */
export function formatTokenValue(
  value: bigint | string | undefined,
  tokenDecimals = 18,
  displayDecimals = 4
): string {
  if (!value) return '0';
  const raw = typeof value === 'string' ? BigInt(value) : value;
  const formatted = formatUnits(raw, tokenDecimals);
  return parseFloat(formatted).toFixed(displayDecimals);
}

/**
 * Parses a string to ETH value (bigint in wei)
 */
export function parseEthInput(value: string): bigint | null {
  try {
    return parseEther(value);
  } catch {
    return null;
  }
}

/**
 * Parses a string to token value with custom decimals
 */
export function parseTokenInput(value: string, decimals = 18): bigint | null {
  try {
    return parseUnits(value, decimals);
  } catch {
    return null;
  }
}

/**
 * Formats a percentage value
 */
export function formatPercentage(value: number, decimals = 2): string {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Converts basis points to percentage
 */
export function bpsToPercentage(bps: number): number {
  return bps / 100;
}

/**
 * Converts percentage to basis points
 */
export function percentageToBps(percentage: number): number {
  return Math.round(percentage * 100);
}

/**
 * Formats a number in compact notation (e.g., 1.2K, 3.4M)
 */
export function formatCompact(value: number): string {
  if (isNaN(value)) return '0';
  
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  });
  
  return formatter.format(value);
}

/**
 * Formats a large number with abbreviation
 */
export function abbreviateNumber(value: number): string {
  if (isNaN(value)) return '0';
  
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  let suffixIndex = 0;
  let num = value;
  
  while (num >= 1000 && suffixIndex < suffixes.length - 1) {
    num /= 1000;
    suffixIndex++;
  }
  
  return `${num.toFixed(num < 10 && suffixIndex > 0 ? 1 : 0)}${suffixes[suffixIndex]}`;
}

/**
 * Clamps a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Rounds to a specific decimal place
 */
export function roundTo(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Checks if a value is a valid number
 */
export function isValidNumber(value: string | number | undefined): boolean {
  if (value === undefined || value === '') return false;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && isFinite(num);
}

/**
 * Formats wei to gwei
 */
export function weiToGwei(wei: bigint): string {
  return formatUnits(wei, 9);
}

/**
 * Parses gwei to wei
 */
export function gweiToWei(gwei: string): bigint {
  return parseUnits(gwei, 9);
}

/**
 * Returns the minimum of an array of bigints
 */
export function minBigInt(...values: bigint[]): bigint {
  return values.reduce((min, val) => val < min ? val : min);
}

/**
 * Returns the maximum of an array of bigints
 */
export function maxBigInt(...values: bigint[]): bigint {
  return values.reduce((max, val) => val > max ? val : max);
}

/**
 * Calculates percentage of a bigint
 */
export function percentageOfBigInt(value: bigint, percentage: number): bigint {
  return (value * BigInt(Math.round(percentage * 100))) / BigInt(10000);
}

export default {
  formatWithCommas,
  formatEthValue,
  formatTokenValue,
  parseEthInput,
  parseTokenInput,
  formatPercentage,
  bpsToPercentage,
  percentageToBps,
  formatCompact,
  abbreviateNumber,
  clamp,
  roundTo,
  isValidNumber,
  weiToGwei,
  gweiToWei,
  minBigInt,
  maxBigInt,
  percentageOfBigInt,
};

