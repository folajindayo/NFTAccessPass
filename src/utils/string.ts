/**
 * String manipulation utilities
 */

/**
 * Truncates a string to a maximum length with ellipsis
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitalizes the first letter of each word
 */
export function titleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Converts a string to camelCase
 */
export function toCamelCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
}

/**
 * Converts a string to kebab-case
 */
export function toKebabCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Converts a string to snake_case
 */
export function toSnakeCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Removes extra whitespace from a string
 */
export function normalizeWhitespace(str: string): string {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Removes all whitespace from a string
 */
export function removeWhitespace(str: string): string {
  if (!str) return '';
  return str.replace(/\s/g, '');
}

/**
 * Checks if a string is empty or only whitespace
 */
export function isBlank(str: string | undefined | null): boolean {
  return !str || str.trim() === '';
}

/**
 * Checks if a string is not empty and not just whitespace
 */
export function isNotBlank(str: string | undefined | null): str is string {
  return !isBlank(str);
}

/**
 * Pads a string to a specified length
 */
export function padStart(str: string, length: number, char = '0'): string {
  if (!str) return char.repeat(length);
  return str.padStart(length, char);
}

/**
 * Pads a string to a specified length (end)
 */
export function padEnd(str: string, length: number, char = ' '): string {
  if (!str) return char.repeat(length);
  return str.padEnd(length, char);
}

/**
 * Escapes HTML entities in a string
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, char => htmlEscapes[char]);
}

/**
 * Generates a slug from a string
 */
export function slugify(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Pluralizes a word based on count
 */
export function pluralize(word: string, count: number, plural?: string): string {
  if (count === 1) return word;
  return plural || `${word}s`;
}

/**
 * Generates initials from a name
 */
export function getInitials(name: string, maxInitials = 2): string {
  if (!name) return '';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxInitials)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

/**
 * Masks a string with a character (e.g., for passwords)
 */
export function mask(str: string, char = '•', visibleStart = 0, visibleEnd = 0): string {
  if (!str) return '';
  if (visibleStart + visibleEnd >= str.length) return str;
  
  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd || str.length);
  const masked = char.repeat(str.length - visibleStart - visibleEnd);
  
  return start + masked + end;
}

/**
 * Checks if a string contains another string (case-insensitive)
 */
export function containsIgnoreCase(str: string, search: string): boolean {
  if (!str || !search) return false;
  return str.toLowerCase().includes(search.toLowerCase());
}

/**
 * Highlights search terms in a string (returns HTML)
 */
export function highlightSearch(text: string, search: string): string {
  if (!text || !search) return text;
  const regex = new RegExp(`(${escapeRegex(search)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Escapes special regex characters
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generates a random string of specified length
 */
export function randomString(length: number, charset = 'alphanumeric'): string {
  const charsets: Record<string, string> = {
    alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    numeric: '0123456789',
    hex: '0123456789abcdef',
  };
  
  const chars = charsets[charset] || charset;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default {
  truncate,
  capitalize,
  titleCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  normalizeWhitespace,
  removeWhitespace,
  isBlank,
  isNotBlank,
  padStart,
  padEnd,
  escapeHtml,
  slugify,
  pluralize,
  getInitials,
  mask,
  containsIgnoreCase,
  highlightSearch,
  escapeRegex,
  randomString,
};

