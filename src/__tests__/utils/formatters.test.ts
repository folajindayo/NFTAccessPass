import { truncateAddress } from '@/utils/formatters';

describe('truncateAddress', () => {
  it('truncates long address correctly', () => {
    expect(truncateAddress('0x1234567890123456789012345678901234567890')).toBe('0x1234...7890');
  });

  it('returns empty string for empty input', () => {
    expect(truncateAddress('')).toBe('');
  });
});

