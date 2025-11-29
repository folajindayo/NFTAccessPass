/**
 * Address formatting and validation utilities
 */

import { getAddress, isAddress } from 'viem';

/**
 * Checks if a string is a valid Ethereum address
 */
export function isValidAddress(address: string | undefined | null): address is `0x${string}` {
  if (!address) return false;
  return isAddress(address);
}

/**
 * Returns checksummed address or null if invalid
 */
export function toChecksumAddress(address: string): `0x${string}` | null {
  try {
    return getAddress(address);
  } catch {
    return null;
  }
}

/**
 * Truncates an address for display (e.g., 0x1234...5678)
 */
export function truncateAddress(
  address: string | undefined | null,
  startChars = 6,
  endChars = 4
): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Formats address with optional ENS fallback
 */
export function formatAddress(
  address: string | undefined | null,
  ensName?: string | null
): string {
  if (ensName) return ensName;
  return truncateAddress(address);
}

/**
 * Compares two addresses case-insensitively
 */
export function addressesEqual(
  address1: string | undefined | null,
  address2: string | undefined | null
): boolean {
  if (!address1 || !address2) return false;
  return address1.toLowerCase() === address2.toLowerCase();
}

/**
 * Gets the first N characters of an address (including 0x)
 */
export function addressPrefix(address: string, length = 6): string {
  if (!address) return '';
  return address.slice(0, length);
}

/**
 * Gets the last N characters of an address
 */
export function addressSuffix(address: string, length = 4): string {
  if (!address) return '';
  return address.slice(-length);
}

/**
 * Creates a blockies-style seed from address for avatar generation
 */
export function getAddressSeed(address: string): number {
  if (!address) return 0;
  return parseInt(address.slice(2, 10), 16);
}

/**
 * Checks if an address is a contract (basic check - starts with 0x)
 */
export function isContractAddress(address: string): boolean {
  return isValidAddress(address) && address.startsWith('0x');
}

/**
 * Returns a CSS color based on address
 */
export function addressToColor(address: string): string {
  if (!address || address.length < 8) return '#6366f1';
  const hash = parseInt(address.slice(2, 8), 16);
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

/**
 * Masks the middle portion of an address
 */
export function maskAddress(
  address: string,
  visibleStart = 6,
  visibleEnd = 4
): string {
  if (!address) return '';
  if (address.length <= visibleStart + visibleEnd) return address;
  const mask = '•'.repeat(4);
  return `${address.slice(0, visibleStart)}${mask}${address.slice(-visibleEnd)}`;
}

/**
 * Zero address constant
 */
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

/**
 * Checks if address is zero address
 */
export function isZeroAddress(address: string | undefined | null): boolean {
  if (!address) return false;
  return address.toLowerCase() === ZERO_ADDRESS.toLowerCase();
}

/**
 * Dead address constant (commonly used for burns)
 */
export const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD' as const;

/**
 * Checks if address is dead address
 */
export function isDeadAddress(address: string | undefined | null): boolean {
  if (!address) return false;
  return address.toLowerCase() === DEAD_ADDRESS.toLowerCase();
}

/**
 * Checks if address is a burn address (zero or dead)
 */
export function isBurnAddress(address: string | undefined | null): boolean {
  return isZeroAddress(address) || isDeadAddress(address);
}

/**
 * Convert address to bytes20
 */
export function addressToBytes(address: string): Uint8Array {
  if (!isValidAddress(address)) {
    throw new Error('Invalid address');
  }
  const hex = address.slice(2);
  const bytes = new Uint8Array(20);
  for (let i = 0; i < 20; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Convert bytes20 to address
 */
export function bytesToAddress(bytes: Uint8Array): `0x${string}` {
  if (bytes.length !== 20) {
    throw new Error('Bytes must be exactly 20 bytes');
  }
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `0x${hex}` as `0x${string}`;
}

/**
 * Pad address to 32 bytes (for ABI encoding)
 */
export function padAddress(address: string): `0x${string}` {
  if (!isValidAddress(address)) {
    throw new Error('Invalid address');
  }
  const clean = address.slice(2).toLowerCase();
  return `0x${clean.padStart(64, '0')}` as `0x${string}`;
}

/**
 * Extract address from 32-byte padded hex
 */
export function unpadAddress(paddedAddress: string): `0x${string}` {
  const clean = paddedAddress.startsWith('0x') 
    ? paddedAddress.slice(2) 
    : paddedAddress;
  
  if (clean.length !== 64) {
    throw new Error('Padded address must be 64 characters');
  }
  
  return `0x${clean.slice(-40)}` as `0x${string}`;
}

/**
 * Get address from various formats
 */
export function normalizeAddress(address: string | undefined | null): `0x${string}` | null {
  if (!address) return null;
  
  // Already valid address
  if (isValidAddress(address)) {
    return toChecksumAddress(address);
  }
  
  // Try to extract from padded format
  if (address.length === 66 || address.length === 64) {
    try {
      const extracted = unpadAddress(address);
      if (isValidAddress(extracted)) {
        return toChecksumAddress(extracted);
      }
    } catch {
      // Not a valid padded address
    }
  }
  
  return null;
}

/**
 * Generate deterministic gradient for address
 */
export function addressToGradient(address: string): string {
  if (!address || address.length < 10) {
    return 'linear-gradient(135deg, #6366f1, #8b5cf6)';
  }
  
  const hash1 = parseInt(address.slice(2, 8), 16);
  const hash2 = parseInt(address.slice(8, 14), 16);
  
  const hue1 = hash1 % 360;
  const hue2 = (hash2 % 360);
  
  return `linear-gradient(135deg, hsl(${hue1}, 65%, 55%), hsl(${hue2}, 65%, 55%))`;
}

/**
 * Create address mapping key (for case-insensitive maps)
 */
export function createAddressKey(address: string): string {
  return address.toLowerCase();
}

/**
 * Check if addresses array contains address
 */
export function includesAddress(addresses: string[], address: string): boolean {
  const normalizedAddress = address.toLowerCase();
  return addresses.some(a => a.toLowerCase() === normalizedAddress);
}

/**
 * Remove duplicates from address array
 */
export function uniqueAddresses(addresses: string[]): string[] {
  const seen = new Set<string>();
  return addresses.filter(address => {
    const key = address.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Sort addresses alphabetically
 */
export function sortAddresses(addresses: string[]): string[] {
  return [...addresses].sort((a, b) => 
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
}

export default {
  isValidAddress,
  toChecksumAddress,
  truncateAddress,
  formatAddress,
  addressesEqual,
  addressPrefix,
  addressSuffix,
  getAddressSeed,
  isContractAddress,
  addressToColor,
  addressToGradient,
  maskAddress,
  isZeroAddress,
  isDeadAddress,
  isBurnAddress,
  addressToBytes,
  bytesToAddress,
  padAddress,
  unpadAddress,
  normalizeAddress,
  createAddressKey,
  includesAddress,
  uniqueAddresses,
  sortAddresses,
  ZERO_ADDRESS,
  DEAD_ADDRESS,
};

