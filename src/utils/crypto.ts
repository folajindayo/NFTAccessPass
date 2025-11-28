/**
 * Cryptographic utilities for hashing and verification
 */

import { keccak256, toBytes, toHex } from 'viem';

/**
 * Computes keccak256 hash of a string
 */
export function hashMessage(message: string): `0x${string}` {
  return keccak256(toBytes(message));
}

/**
 * Computes keccak256 hash of hex data
 */
export function hashHex(hexData: `0x${string}`): `0x${string}` {
  return keccak256(hexData);
}

/**
 * Generates a random bytes32 value
 */
export function randomBytes32(): `0x${string}` {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toHex(bytes) as `0x${string}`;
}

/**
 * Generates a random hex string of specified length
 */
export function randomHex(byteLength: number): `0x${string}` {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return toHex(bytes) as `0x${string}`;
}

/**
 * Generates a random nonce
 */
export function generateNonce(): string {
  return randomBytes32();
}

/**
 * Creates a deterministic hash from multiple inputs
 */
export function hashInputs(...inputs: string[]): `0x${string}` {
  const combined = inputs.join('');
  return hashMessage(combined);
}

/**
 * Computes SHA-256 hash using Web Crypto API
 */
export async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Encodes data to base64
 */
export function toBase64(data: string): string {
  if (typeof btoa !== 'undefined') {
    return btoa(data);
  }
  return Buffer.from(data).toString('base64');
}

/**
 * Decodes data from base64
 */
export function fromBase64(encoded: string): string {
  if (typeof atob !== 'undefined') {
    return atob(encoded);
  }
  return Buffer.from(encoded, 'base64').toString();
}

/**
 * Encodes data to base64url (URL-safe base64)
 */
export function toBase64Url(data: string): string {
  return toBase64(data)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Decodes data from base64url
 */
export function fromBase64Url(encoded: string): string {
  const padded = encoded + '='.repeat((4 - (encoded.length % 4)) % 4);
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  return fromBase64(base64);
}

/**
 * Generates a UUID v4
 */
export function uuid(): string {
  return crypto.randomUUID();
}

/**
 * Verifies if two hex strings are equal (constant-time comparison)
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generates a secure random string for tokens/identifiers
 */
export function generateSecureToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

/**
 * Converts a signature to its v, r, s components
 */
export function splitSignature(signature: `0x${string}`): {
  v: number;
  r: `0x${string}`;
  s: `0x${string}`;
} {
  const sig = signature.slice(2);
  const r = `0x${sig.slice(0, 64)}` as `0x${string}`;
  const s = `0x${sig.slice(64, 128)}` as `0x${string}`;
  const v = parseInt(sig.slice(128, 130), 16);
  
  return { v, r, s };
}

/**
 * Joins v, r, s components into a signature
 */
export function joinSignature(v: number, r: `0x${string}`, s: `0x${string}`): `0x${string}` {
  return `0x${r.slice(2)}${s.slice(2)}${v.toString(16).padStart(2, '0')}` as `0x${string}`;
}

/**
 * Checks if a string is a valid hex string
 */
export function isValidHex(value: string): value is `0x${string}` {
  return /^0x[0-9a-fA-F]*$/.test(value);
}

/**
 * Pads a hex string to a specific byte length
 */
export function padHex(hex: string, byteLength: number): `0x${string}` {
  const value = hex.startsWith('0x') ? hex.slice(2) : hex;
  return `0x${value.padStart(byteLength * 2, '0')}` as `0x${string}`;
}

/**
 * Computes a checksum for data integrity
 */
export async function computeChecksum(data: string): Promise<string> {
  const hash = await sha256(data);
  return hash.slice(0, 8);
}

/**
 * Verifies a checksum
 */
export async function verifyChecksum(data: string, checksum: string): Promise<boolean> {
  const computed = await computeChecksum(data);
  return constantTimeEqual(computed, checksum);
}

export default {
  hashMessage,
  hashHex,
  randomBytes32,
  randomHex,
  generateNonce,
  hashInputs,
  sha256,
  toBase64,
  fromBase64,
  toBase64Url,
  fromBase64Url,
  uuid,
  constantTimeEqual,
  generateSecureToken,
  splitSignature,
  joinSignature,
  isValidHex,
  padHex,
  computeChecksum,
  verifyChecksum,
};

