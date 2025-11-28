import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatCurrency,
  formatCompact,
  formatPercentage,
  parseNumber,
  clamp,
  roundTo,
  isValidNumber,
} from '@/utils/number';

describe('formatNumber', () => {
  it('formats numbers with default locale', () => {
    expect(formatNumber(1234567.89)).toBe('1,234,567.89');
  });

  it('formats with specified decimal places', () => {
    expect(formatNumber(1234.5678, { decimals: 2 })).toBe('1,234.57');
    expect(formatNumber(1234.5, { decimals: 4 })).toBe('1,234.5000');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('handles negative numbers', () => {
    expect(formatNumber(-1234.56)).toBe('-1,234.56');
  });

  it('formats large numbers', () => {
    expect(formatNumber(1000000000)).toBe('1,000,000,000');
  });
});

describe('formatCurrency', () => {
  it('formats as USD by default', () => {
    const result = formatCurrency(1234.56);
    expect(result).toMatch(/\$?1,?234\.56/);
  });

  it('formats with ETH', () => {
    const result = formatCurrency(1.234, { currency: 'ETH' });
    expect(result).toContain('1.234');
    expect(result).toContain('ETH');
  });

  it('handles different currencies', () => {
    const eur = formatCurrency(1234.56, { currency: 'EUR' });
    expect(eur).toMatch(/€|EUR/);
  });

  it('formats with specified decimals', () => {
    const result = formatCurrency(1234.5678, { decimals: 4, currency: 'USD' });
    expect(result).toContain('1234.5678');
  });
});

describe('formatCompact', () => {
  it('formats thousands with K', () => {
    expect(formatCompact(1500)).toBe('1.5K');
    expect(formatCompact(12345)).toBe('12.3K');
  });

  it('formats millions with M', () => {
    expect(formatCompact(1500000)).toBe('1.5M');
    expect(formatCompact(12345678)).toBe('12.3M');
  });

  it('formats billions with B', () => {
    expect(formatCompact(1500000000)).toBe('1.5B');
  });

  it('does not compact small numbers', () => {
    expect(formatCompact(999)).toBe('999');
  });

  it('handles zero', () => {
    expect(formatCompact(0)).toBe('0');
  });

  it('handles negative numbers', () => {
    expect(formatCompact(-1500)).toBe('-1.5K');
  });
});

describe('formatPercentage', () => {
  it('formats decimal as percentage', () => {
    expect(formatPercentage(0.5)).toBe('50%');
    expect(formatPercentage(0.125)).toBe('12.5%');
  });

  it('formats with specified decimals', () => {
    expect(formatPercentage(0.12345, 2)).toBe('12.35%');
  });

  it('handles values over 1', () => {
    expect(formatPercentage(1.5)).toBe('150%');
  });

  it('handles zero', () => {
    expect(formatPercentage(0)).toBe('0%');
  });

  it('handles negative values', () => {
    expect(formatPercentage(-0.25)).toBe('-25%');
  });
});

describe('parseNumber', () => {
  it('parses integer string', () => {
    expect(parseNumber('1234')).toBe(1234);
  });

  it('parses decimal string', () => {
    expect(parseNumber('1234.56')).toBe(1234.56);
  });

  it('parses formatted number', () => {
    expect(parseNumber('1,234.56')).toBe(1234.56);
  });

  it('returns fallback for invalid input', () => {
    expect(parseNumber('invalid', 0)).toBe(0);
    expect(parseNumber('', 0)).toBe(0);
  });

  it('parses negative numbers', () => {
    expect(parseNumber('-1234.56')).toBe(-1234.56);
  });
});

describe('clamp', () => {
  it('returns value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to minimum', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps to maximum', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('handles equal min and max', () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });
});

describe('roundTo', () => {
  it('rounds to specified decimal places', () => {
    expect(roundTo(1.2345, 2)).toBe(1.23);
    expect(roundTo(1.2355, 2)).toBe(1.24);
  });

  it('rounds to integer', () => {
    expect(roundTo(1.5, 0)).toBe(2);
    expect(roundTo(1.4, 0)).toBe(1);
  });

  it('handles negative numbers', () => {
    expect(roundTo(-1.2345, 2)).toBe(-1.23);
  });
});

describe('isValidNumber', () => {
  it('returns true for valid numbers', () => {
    expect(isValidNumber(123)).toBe(true);
    expect(isValidNumber(0)).toBe(true);
    expect(isValidNumber(-456)).toBe(true);
    expect(isValidNumber(1.23)).toBe(true);
  });

  it('returns false for NaN', () => {
    expect(isValidNumber(NaN)).toBe(false);
  });

  it('returns false for Infinity', () => {
    expect(isValidNumber(Infinity)).toBe(false);
    expect(isValidNumber(-Infinity)).toBe(false);
  });

  it('returns false for non-numbers', () => {
    expect(isValidNumber('123' as unknown as number)).toBe(false);
    expect(isValidNumber(null as unknown as number)).toBe(false);
    expect(isValidNumber(undefined as unknown as number)).toBe(false);
  });
});

