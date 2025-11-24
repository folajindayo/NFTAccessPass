/**
 * Utility functions for formatting data.
 */

/**
 * Truncates a wallet address for display.
 * @param address - The full wallet address.
 * @param start - Number of characters to keep at the start (default: 6).
 * @param end - Number of characters to keep at the end (default: 4).
 * @returns The truncated address string.
 */
export const formatAddress = (address: string, start = 6, end = 4): string => {
  if (!address) return '';
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

/**
 * Formats a number as a currency string (USD).
 * @param amount - The number to format.
 * @returns Formatted currency string.
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Formats a Date object or timestamp into a readable date string.
 * @param date - The date to format.
 * @returns Formatted date string.
 */
export const formatDate = (date: Date | number | string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

