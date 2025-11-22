import { isValidAddress } from '@/utils/validators';

describe('isValidAddress', () => {
  it('returns true for valid address', () => {
    expect(isValidAddress('0x1234567890123456789012345678901234567890')).toBe(true);
  });

  it('returns false for invalid address', () => {
    expect(isValidAddress('invalid')).toBe(false);
  });
});

