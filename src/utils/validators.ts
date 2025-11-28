/**
 * Validation utilities with type guards
 */

import { isAddress } from 'viem';
import { PATTERNS } from './constants';

/**
 * Validates an Ethereum address
 */
export function isValidAddress(address: string | undefined | null): address is `0x${string}` {
  if (!address) return false;
  return isAddress(address);
}

/**
 * Validates a transaction hash
 */
export function isValidTxHash(hash: string | undefined | null): hash is `0x${string}` {
  if (!hash) return false;
  return PATTERNS.TX_HASH.test(hash);
}

/**
 * Validates a hex string
 */
export function isValidHex(value: string | undefined | null): value is `0x${string}` {
  if (!value) return false;
  return PATTERNS.HEX.test(value);
}

/**
 * Validates an email address
 */
export function isValidEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return PATTERNS.EMAIL.test(email);
}

/**
 * Validates a URL
 */
export function isValidUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates an IPFS hash
 */
export function isValidIpfsHash(hash: string | undefined | null): boolean {
  if (!hash) return false;
  return PATTERNS.IPFS_HASH.test(hash);
}

/**
 * Validates an ENS name
 */
export function isValidEnsName(name: string | undefined | null): boolean {
  if (!name) return false;
  return PATTERNS.ENS_NAME.test(name);
}

/**
 * Validates a number string
 */
export function isValidNumber(value: string | undefined | null): boolean {
  if (!value) return false;
  return PATTERNS.NUMBER.test(value);
}

/**
 * Validates an integer string
 */
export function isValidInteger(value: string | undefined | null): boolean {
  if (!value) return false;
  return PATTERNS.INTEGER.test(value);
}

/**
 * Validates if a value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Validates if a string is not empty
 */
export function isNotEmpty(value: string | undefined | null): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates if an array is not empty
 */
export function isNotEmptyArray<T>(value: T[] | undefined | null): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Validates if a value is a positive number
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Validates if a value is a non-negative number
 */
export function isNonNegativeNumber(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

/**
 * Validates if a value is within a range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
}

/**
 * Validates if a string length is within bounds
 */
export function isValidLength(
  value: string | undefined | null,
  minLength: number,
  maxLength: number
): boolean {
  if (!value) return minLength === 0;
  return value.length >= minLength && value.length <= maxLength;
}

/**
 * Validates ETH amount (positive, valid decimal places)
 */
export function isValidEthAmount(amount: string | undefined | null): boolean {
  if (!amount) return false;
  if (!PATTERNS.NUMBER.test(amount)) return false;
  
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) return false;
  
  // Check decimal places (max 18 for ETH)
  const decimals = amount.split('.')[1]?.length || 0;
  return decimals <= 18;
}

/**
 * Validates a token ID
 */
export function isValidTokenId(id: string | number | undefined | null): boolean {
  if (id === null || id === undefined) return false;
  
  const num = typeof id === 'string' ? parseInt(id, 10) : id;
  return !isNaN(num) && num >= 0 && Number.isInteger(num);
}

/**
 * Validates a chain ID
 */
export function isValidChainId(chainId: number | undefined | null): boolean {
  return typeof chainId === 'number' && chainId > 0 && Number.isInteger(chainId);
}

/**
 * Validates a block number
 */
export function isValidBlockNumber(block: number | string | undefined | null): boolean {
  if (block === null || block === undefined) return false;
  
  const num = typeof block === 'string' ? parseInt(block, 10) : block;
  return !isNaN(num) && num >= 0 && Number.isInteger(num);
}

/**
 * Validates a timestamp (Unix seconds)
 */
export function isValidTimestamp(timestamp: number | undefined | null): boolean {
  if (!timestamp) return false;
  return timestamp > 0 && timestamp < Date.now() / 1000 + 86400 * 365 * 100; // Not more than 100 years in future
}

/**
 * Validates a date string
 */
export function isValidDateString(date: string | undefined | null): boolean {
  if (!date) return false;
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

/**
 * Validates JSON string
 */
export function isValidJson(value: string | undefined | null): boolean {
  if (!value) return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates file type against allowed types
 */
export function isValidFileType(
  mimeType: string,
  allowedTypes: readonly string[]
): boolean {
  return allowedTypes.includes(mimeType);
}

/**
 * Validates file size against maximum
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Validates that a private key format (without checking validity)
 */
export function isValidPrivateKeyFormat(key: string | undefined | null): boolean {
  if (!key) return false;
  // 64 hex chars or 66 with 0x prefix
  return /^(0x)?[a-fA-F0-9]{64}$/.test(key);
}

/**
 * Type guard for checking if error is an Error instance
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard for checking if value is a plain object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard for checking if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard for checking if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export default {
  isValidAddress,
  isValidTxHash,
  isValidHex,
  isValidEmail,
  isValidUrl,
  isValidIpfsHash,
  isValidEnsName,
  isValidNumber,
  isValidInteger,
  isDefined,
  isNotEmpty,
  isNotEmptyArray,
  isPositiveNumber,
  isNonNegativeNumber,
  isInRange,
  isValidLength,
  isValidEthAmount,
  isValidTokenId,
  isValidChainId,
  isValidBlockNumber,
  isValidTimestamp,
  isValidDateString,
  isValidJson,
  isValidFileType,
  isValidFileSize,
  isValidPrivateKeyFormat,
  isError,
  isObject,
  isString,
  isNumber,
};
