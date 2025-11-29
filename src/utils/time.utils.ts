/**
 * Time utility functions
 * Helpers for time formatting and calculations
 */

export type TimeUnit = 
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'year';

/**
 * Time units in milliseconds
 */
export const TIME_MS = {
  millisecond: 1,
  second: 1000,
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Convert time between units
 */
export function convertTime(
  value: number,
  from: TimeUnit,
  to: TimeUnit
): number {
  const msValue = value * TIME_MS[from];
  return msValue / TIME_MS[to];
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(ms: number, maxUnits: number = 2): string {
  if (ms < 1000) {
    return 'less than a second';
  }

  const units: Array<{ unit: string; value: number }> = [];
  let remaining = ms;

  if (remaining >= TIME_MS.year) {
    const years = Math.floor(remaining / TIME_MS.year);
    units.push({ unit: years === 1 ? 'year' : 'years', value: years });
    remaining %= TIME_MS.year;
  }

  if (remaining >= TIME_MS.day && units.length < maxUnits) {
    const days = Math.floor(remaining / TIME_MS.day);
    units.push({ unit: days === 1 ? 'day' : 'days', value: days });
    remaining %= TIME_MS.day;
  }

  if (remaining >= TIME_MS.hour && units.length < maxUnits) {
    const hours = Math.floor(remaining / TIME_MS.hour);
    units.push({ unit: hours === 1 ? 'hour' : 'hours', value: hours });
    remaining %= TIME_MS.hour;
  }

  if (remaining >= TIME_MS.minute && units.length < maxUnits) {
    const minutes = Math.floor(remaining / TIME_MS.minute);
    units.push({ unit: minutes === 1 ? 'minute' : 'minutes', value: minutes });
    remaining %= TIME_MS.minute;
  }

  if (remaining >= TIME_MS.second && units.length < maxUnits) {
    const seconds = Math.floor(remaining / TIME_MS.second);
    units.push({ unit: seconds === 1 ? 'second' : 'seconds', value: seconds });
  }

  return units.map(u => `${u.value} ${u.unit}`).join(', ');
}

/**
 * Format time ago (relative time)
 */
export function timeAgo(timestamp: number | Date): string {
  const now = Date.now();
  const date = timestamp instanceof Date ? timestamp.getTime() : timestamp;
  const diff = now - date;

  if (diff < TIME_MS.minute) {
    return 'just now';
  }

  if (diff < TIME_MS.hour) {
    const minutes = Math.floor(diff / TIME_MS.minute);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  if (diff < TIME_MS.day) {
    const hours = Math.floor(diff / TIME_MS.hour);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  if (diff < TIME_MS.week) {
    const days = Math.floor(diff / TIME_MS.day);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  if (diff < TIME_MS.month) {
    const weeks = Math.floor(diff / TIME_MS.week);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }

  if (diff < TIME_MS.year) {
    const months = Math.floor(diff / TIME_MS.month);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }

  const years = Math.floor(diff / TIME_MS.year);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

/**
 * Format timestamp to date string
 */
export function formatTimestamp(
  timestamp: number | Date,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  
  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' },
  }[format];

  return date.toLocaleDateString(undefined, options);
}

/**
 * Format time only
 */
export function formatTime(
  timestamp: number | Date,
  includeSeconds: boolean = false
): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' }),
  };

  return date.toLocaleTimeString(undefined, options);
}

/**
 * Get start of day
 */
export function startOfDay(timestamp: number | Date): Date {
  const date = timestamp instanceof Date ? new Date(timestamp) : new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Get end of day
 */
export function endOfDay(timestamp: number | Date): Date {
  const date = timestamp instanceof Date ? new Date(timestamp) : new Date(timestamp);
  date.setHours(23, 59, 59, 999);
  return date;
}

/**
 * Check if same day
 */
export function isSameDay(date1: Date | number, date2: Date | number): boolean {
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Add time to date
 */
export function addTime(
  date: Date | number,
  amount: number,
  unit: TimeUnit
): Date {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  const ms = amount * TIME_MS[unit];
  return new Date(d.getTime() + ms);
}

/**
 * Subtract time from date
 */
export function subtractTime(
  date: Date | number,
  amount: number,
  unit: TimeUnit
): Date {
  return addTime(date, -amount, unit);
}

/**
 * Get difference between dates
 */
export function diffTime(
  date1: Date | number,
  date2: Date | number,
  unit: TimeUnit = 'millisecond'
): number {
  const d1 = date1 instanceof Date ? date1.getTime() : date1;
  const d2 = date2 instanceof Date ? date2.getTime() : date2;
  
  return Math.abs(d1 - d2) / TIME_MS[unit];
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | number): boolean {
  const d = date instanceof Date ? date.getTime() : date;
  return d < Date.now();
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | number): boolean {
  const d = date instanceof Date ? date.getTime() : date;
  return d > Date.now();
}

/**
 * Get Unix timestamp (seconds)
 */
export function toUnixTimestamp(date: Date | number = Date.now()): number {
  const d = date instanceof Date ? date.getTime() : date;
  return Math.floor(d / 1000);
}

/**
 * Convert Unix timestamp to Date
 */
export function fromUnixTimestamp(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

/**
 * Format countdown
 */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00';

  const hours = Math.floor(ms / TIME_MS.hour);
  const minutes = Math.floor((ms % TIME_MS.hour) / TIME_MS.minute);
  const seconds = Math.floor((ms % TIME_MS.minute) / TIME_MS.second);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get block timestamp estimate (for blockchain)
 */
export function estimateBlockTimestamp(
  currentBlock: number,
  targetBlock: number,
  avgBlockTime: number = 12000 // 12 seconds default for Ethereum
): number {
  const blockDiff = targetBlock - currentBlock;
  const timeDiff = blockDiff * avgBlockTime;
  return Date.now() + timeDiff;
}

