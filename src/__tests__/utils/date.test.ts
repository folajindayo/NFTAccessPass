import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatRelative,
  formatTimeAgo,
  isToday,
  isYesterday,
  addDays,
  differenceInDays,
  startOfDay,
  endOfDay,
  parseDate,
} from '@/utils/date';

describe('formatDate', () => {
  it('formats date with default format', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toMatch(/Jan.*15.*2024|15.*Jan.*2024/);
  });

  it('formats with custom format', () => {
    const date = new Date('2024-01-15');
    const result = formatDate(date, { format: 'short' });
    expect(result).toBeTruthy();
  });

  it('handles timestamp', () => {
    const timestamp = new Date('2024-01-15').getTime();
    expect(formatDate(timestamp)).toMatch(/Jan.*15.*2024|15.*Jan.*2024/);
  });

  it('handles ISO string', () => {
    const result = formatDate('2024-01-15');
    expect(result).toMatch(/Jan.*15.*2024|15.*Jan.*2024/);
  });
});

describe('formatDateTime', () => {
  it('formats date and time', () => {
    const date = new Date('2024-01-15T14:30:00');
    const result = formatDateTime(date);
    expect(result).toContain('14:30');
  });

  it('handles different time formats', () => {
    const date = new Date('2024-01-15T14:30:00');
    const result = formatDateTime(date, { hour12: true });
    expect(result).toMatch(/2:30.*PM|14:30/);
  });
});

describe('formatRelative', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats today', () => {
    const today = new Date('2024-01-15T10:00:00');
    expect(formatRelative(today)).toMatch(/today|2 hours/i);
  });

  it('formats yesterday', () => {
    const yesterday = new Date('2024-01-14T12:00:00');
    expect(formatRelative(yesterday)).toMatch(/yesterday|1 day/i);
  });

  it('formats older dates', () => {
    const older = new Date('2024-01-10T12:00:00');
    expect(formatRelative(older)).toMatch(/5 days|Jan 10/i);
  });
});

describe('formatTimeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats seconds ago', () => {
    const recent = new Date('2024-01-15T11:59:30');
    expect(formatTimeAgo(recent)).toMatch(/seconds|just now/i);
  });

  it('formats minutes ago', () => {
    const minutes = new Date('2024-01-15T11:55:00');
    expect(formatTimeAgo(minutes)).toMatch(/5.*minutes/i);
  });

  it('formats hours ago', () => {
    const hours = new Date('2024-01-15T09:00:00');
    expect(formatTimeAgo(hours)).toMatch(/3.*hours/i);
  });

  it('formats days ago', () => {
    const days = new Date('2024-01-12T12:00:00');
    expect(formatTimeAgo(days)).toMatch(/3.*days/i);
  });

  it('formats weeks ago', () => {
    const weeks = new Date('2024-01-01T12:00:00');
    expect(formatTimeAgo(weeks)).toMatch(/2.*weeks/i);
  });

  it('formats months ago', () => {
    const months = new Date('2023-11-15T12:00:00');
    expect(formatTimeAgo(months)).toMatch(/2.*months/i);
  });
});

describe('isToday', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true for today', () => {
    expect(isToday(new Date('2024-01-15T00:00:00'))).toBe(true);
    expect(isToday(new Date('2024-01-15T23:59:59'))).toBe(true);
  });

  it('returns false for yesterday', () => {
    expect(isToday(new Date('2024-01-14T12:00:00'))).toBe(false);
  });

  it('returns false for tomorrow', () => {
    expect(isToday(new Date('2024-01-16T12:00:00'))).toBe(false);
  });
});

describe('isYesterday', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true for yesterday', () => {
    expect(isYesterday(new Date('2024-01-14T12:00:00'))).toBe(true);
  });

  it('returns false for today', () => {
    expect(isYesterday(new Date('2024-01-15T12:00:00'))).toBe(false);
  });
});

describe('addDays', () => {
  it('adds positive days', () => {
    const date = new Date('2024-01-15');
    const result = addDays(date, 5);
    expect(result.getDate()).toBe(20);
  });

  it('subtracts with negative days', () => {
    const date = new Date('2024-01-15');
    const result = addDays(date, -5);
    expect(result.getDate()).toBe(10);
  });

  it('handles month overflow', () => {
    const date = new Date('2024-01-30');
    const result = addDays(date, 5);
    expect(result.getMonth()).toBe(1); // February
  });
});

describe('differenceInDays', () => {
  it('calculates positive difference', () => {
    const date1 = new Date('2024-01-20');
    const date2 = new Date('2024-01-15');
    expect(differenceInDays(date1, date2)).toBe(5);
  });

  it('calculates negative difference', () => {
    const date1 = new Date('2024-01-15');
    const date2 = new Date('2024-01-20');
    expect(differenceInDays(date1, date2)).toBe(-5);
  });

  it('returns 0 for same day', () => {
    const date1 = new Date('2024-01-15T10:00:00');
    const date2 = new Date('2024-01-15T20:00:00');
    expect(differenceInDays(date1, date2)).toBe(0);
  });
});

describe('startOfDay', () => {
  it('returns start of day', () => {
    const date = new Date('2024-01-15T14:30:45');
    const result = startOfDay(date);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });
});

describe('endOfDay', () => {
  it('returns end of day', () => {
    const date = new Date('2024-01-15T14:30:45');
    const result = endOfDay(date);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
});

describe('parseDate', () => {
  it('parses ISO string', () => {
    const result = parseDate('2024-01-15');
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2024);
  });

  it('parses timestamp', () => {
    const timestamp = new Date('2024-01-15').getTime();
    const result = parseDate(timestamp);
    expect(result).toBeInstanceOf(Date);
  });

  it('returns null for invalid input', () => {
    expect(parseDate('invalid')).toBeNull();
  });

  it('handles Date object', () => {
    const date = new Date('2024-01-15');
    const result = parseDate(date);
    expect(result).toEqual(date);
  });
});

