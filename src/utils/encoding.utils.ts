/**
 * Encoding utility functions
 * Helpers for hex, base64, and other encoding operations
 */

/**
 * Convert hex string to bytes
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.slice(i, i + 2), 16);
  }
  
  return bytes;
}

/**
 * Convert bytes to hex string
 */
export function bytesToHex(bytes: Uint8Array, prefix: boolean = true): string {
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return prefix ? `0x${hex}` : hex;
}

/**
 * Convert string to hex
 */
export function stringToHex(str: string, prefix: boolean = true): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  return bytesToHex(bytes, prefix);
}

/**
 * Convert hex to string
 */
export function hexToString(hex: string): string {
  const bytes = hexToBytes(hex);
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

/**
 * Encode to base64
 */
export function toBase64(data: string | Uint8Array): string {
  if (typeof data === 'string') {
    if (typeof btoa !== 'undefined') {
      return btoa(data);
    }
    return Buffer.from(data).toString('base64');
  }
  
  if (typeof btoa !== 'undefined') {
    return btoa(String.fromCharCode(...data));
  }
  return Buffer.from(data).toString('base64');
}

/**
 * Decode from base64
 */
export function fromBase64(base64: string): string {
  if (typeof atob !== 'undefined') {
    return atob(base64);
  }
  return Buffer.from(base64, 'base64').toString();
}

/**
 * Encode to base64url (URL-safe base64)
 */
export function toBase64Url(data: string | Uint8Array): string {
  const base64 = toBase64(data);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decode from base64url
 */
export function fromBase64Url(base64url: string): string {
  let base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  // Add padding
  const padding = base64.length % 4;
  if (padding) {
    base64 += '='.repeat(4 - padding);
  }
  
  return fromBase64(base64);
}

/**
 * Convert number to hex
 */
export function numberToHex(num: number | bigint, prefix: boolean = true): string {
  const hex = BigInt(num).toString(16);
  return prefix ? `0x${hex}` : hex;
}

/**
 * Convert hex to number
 */
export function hexToNumber(hex: string): bigint {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  return BigInt(`0x${cleanHex}`);
}

/**
 * Pad hex to specific length
 */
export function padHex(hex: string, length: number, left: boolean = true): string {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const padded = left
    ? cleanHex.padStart(length, '0')
    : cleanHex.padEnd(length, '0');
  return `0x${padded}`;
}

/**
 * Check if string is valid hex
 */
export function isHex(value: string): boolean {
  const cleanHex = value.startsWith('0x') ? value.slice(2) : value;
  return /^[0-9a-fA-F]*$/.test(cleanHex);
}

/**
 * Encode ABI function selector
 */
export function encodeFunctionSelector(signature: string): string {
  // Simplified - in production use viem's keccak256
  // This returns a placeholder; real implementation would hash
  return `0x${signature.slice(0, 8)}`;
}

/**
 * Encode address for ABI
 */
export function encodeAddress(address: string): string {
  const cleanAddress = address.toLowerCase().replace('0x', '');
  return `0x${cleanAddress.padStart(64, '0')}`;
}

/**
 * Encode uint256 for ABI
 */
export function encodeUint256(value: bigint | number): string {
  const hex = BigInt(value).toString(16);
  return `0x${hex.padStart(64, '0')}`;
}

/**
 * Decode uint256 from ABI
 */
export function decodeUint256(data: string): bigint {
  const cleanData = data.startsWith('0x') ? data.slice(2) : data;
  return BigInt(`0x${cleanData}`);
}

/**
 * Decode address from ABI
 */
export function decodeAddress(data: string): string {
  const cleanData = data.startsWith('0x') ? data.slice(2) : data;
  return `0x${cleanData.slice(-40)}`;
}

/**
 * Concatenate hex strings
 */
export function concatHex(...hexStrings: string[]): string {
  const combined = hexStrings
    .map(h => (h.startsWith('0x') ? h.slice(2) : h))
    .join('');
  return `0x${combined}`;
}

/**
 * Slice hex string
 */
export function sliceHex(hex: string, start: number, end?: number): string {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const sliced = cleanHex.slice(start * 2, end !== undefined ? end * 2 : undefined);
  return `0x${sliced}`;
}

/**
 * Get hex length in bytes
 */
export function hexLength(hex: string): number {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  return cleanHex.length / 2;
}

/**
 * Compare hex values
 */
export function compareHex(a: string, b: string): number {
  const numA = hexToNumber(a);
  const numB = hexToNumber(b);
  
  if (numA < numB) return -1;
  if (numA > numB) return 1;
  return 0;
}

/**
 * Check if hex is zero
 */
export function isZeroHex(hex: string): boolean {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  return /^0*$/.test(cleanHex);
}

