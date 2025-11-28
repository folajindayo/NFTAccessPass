import { describe, it, expect } from 'vitest';
import {
  truncateAddress,
  isValidAddress,
  checksumAddress,
  areAddressesEqual,
  isZeroAddress,
  formatAddressForDisplay,
} from '@/utils/address';

describe('truncateAddress', () => {
  it('truncates address correctly with default settings', () => {
    const address = '0x1234567890123456789012345678901234567890';
    const result = truncateAddress(address);
    expect(result).toBe('0x1234...7890');
  });

  it('truncates with custom start and end lengths', () => {
    const address = '0x1234567890123456789012345678901234567890';
    const result = truncateAddress(address, 8, 8);
    expect(result).toBe('0x123456...34567890');
  });

  it('returns empty string for empty input', () => {
    expect(truncateAddress('')).toBe('');
  });

  it('handles undefined input', () => {
    expect(truncateAddress(undefined as unknown as string)).toBe('');
  });

  it('returns full address if shorter than truncation', () => {
    const shortAddress = '0x1234';
    expect(truncateAddress(shortAddress, 6, 6)).toBe('0x1234');
  });
});

describe('isValidAddress', () => {
  it('returns true for valid ethereum address', () => {
    expect(isValidAddress('0x1234567890123456789012345678901234567890')).toBe(true);
  });

  it('returns true for checksummed address', () => {
    expect(isValidAddress('0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B')).toBe(true);
  });

  it('returns false for invalid address', () => {
    expect(isValidAddress('0xinvalid')).toBe(false);
    expect(isValidAddress('invalid')).toBe(false);
    expect(isValidAddress('')).toBe(false);
  });

  it('returns false for address with wrong length', () => {
    expect(isValidAddress('0x123456789012345678901234567890123456789')).toBe(false);
    expect(isValidAddress('0x12345678901234567890123456789012345678901')).toBe(false);
  });

  it('returns false for non-hex characters', () => {
    expect(isValidAddress('0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG')).toBe(false);
  });
});

describe('checksumAddress', () => {
  it('returns checksummed version of lowercase address', () => {
    const lowercase = '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359';
    const result = checksumAddress(lowercase);
    expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it('handles already checksummed address', () => {
    const checksummed = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B';
    expect(checksumAddress(checksummed)).toBe(checksummed);
  });

  it('handles uppercase address', () => {
    const uppercase = '0xFB6916095CA1DF60BB79CE92CE3EA74C37C5D359';
    const result = checksumAddress(uppercase);
    expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });
});

describe('areAddressesEqual', () => {
  it('returns true for same address with different cases', () => {
    const addr1 = '0x1234567890123456789012345678901234567890';
    const addr2 = '0x1234567890123456789012345678901234567890';
    expect(areAddressesEqual(addr1, addr2)).toBe(true);
  });

  it('returns true comparing lowercase and checksummed', () => {
    const addr1 = '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359';
    const addr2 = '0xFB6916095CA1DF60BB79CE92CE3EA74C37C5D359';
    expect(areAddressesEqual(addr1, addr2)).toBe(true);
  });

  it('returns false for different addresses', () => {
    const addr1 = '0x1234567890123456789012345678901234567890';
    const addr2 = '0x0987654321098765432109876543210987654321';
    expect(areAddressesEqual(addr1, addr2)).toBe(false);
  });

  it('returns false if either is invalid', () => {
    expect(areAddressesEqual('invalid', '0x1234567890123456789012345678901234567890')).toBe(false);
    expect(areAddressesEqual('0x1234567890123456789012345678901234567890', 'invalid')).toBe(false);
  });
});

describe('isZeroAddress', () => {
  it('returns true for zero address', () => {
    expect(isZeroAddress('0x0000000000000000000000000000000000000000')).toBe(true);
  });

  it('returns false for non-zero address', () => {
    expect(isZeroAddress('0x1234567890123456789012345678901234567890')).toBe(false);
  });

  it('handles mixed case zero address', () => {
    expect(isZeroAddress('0x0000000000000000000000000000000000000000')).toBe(true);
  });
});

describe('formatAddressForDisplay', () => {
  it('formats address with ENS when available', () => {
    const result = formatAddressForDisplay(
      '0x1234567890123456789012345678901234567890',
      'vitalik.eth'
    );
    expect(result).toBe('vitalik.eth');
  });

  it('truncates address when no ENS', () => {
    const result = formatAddressForDisplay(
      '0x1234567890123456789012345678901234567890'
    );
    expect(result).toBe('0x1234...7890');
  });

  it('handles empty address', () => {
    expect(formatAddressForDisplay('')).toBe('');
  });
});

