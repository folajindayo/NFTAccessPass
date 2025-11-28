/**
 * Utility constants
 */

/**
 * Time constants (in milliseconds)
 */
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Time constants (in seconds)
 */
export const TIME_SECONDS = {
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000,
  YEAR: 31536000,
} as const;

/**
 * Ethereum constants
 */
export const ETH = {
  ZERO_ADDRESS: '0x0000000000000000000000000000000000000000' as const,
  MAX_UINT256: BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
  DECIMALS: 18,
  GWEI_DECIMALS: 9,
  WEI_PER_ETH: BigInt('1000000000000000000'),
  WEI_PER_GWEI: BigInt('1000000000'),
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Cache durations
 */
export const CACHE_DURATION = {
  SHORT: 30 * 1000, // 30 seconds
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const;

/**
 * Debounce/throttle delays
 */
export const DEBOUNCE = {
  FAST: 100,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

/**
 * Animation durations
 */
export const ANIMATION = {
  INSTANT: 0,
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

/**
 * Breakpoints (matching Tailwind defaults)
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
} as const;

/**
 * File size limits
 */
export const FILE_SIZE = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  MAX_IMAGE: 5 * 1024 * 1024, // 5MB
  MAX_METADATA: 1 * 1024 * 1024, // 1MB
} as const;

/**
 * Status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Regex patterns
 */
export const PATTERNS = {
  ETH_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  TX_HASH: /^0x[a-fA-F0-9]{64}$/,
  HEX: /^0x[a-fA-F0-9]*$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/[^\s]+$/,
  IPFS_HASH: /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|ba[a-z2-7]{57})$/,
  ENS_NAME: /^[a-zA-Z0-9-]+\.eth$/,
  NUMBER: /^\d+(\.\d+)?$/,
  INTEGER: /^\d+$/,
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  THEME: 'theme',
  WALLET_CONNECTED: 'wallet_connected',
  LAST_WALLET: 'last_wallet',
  PREFERENCES: 'preferences',
  CACHE_PREFIX: 'cache_',
} as const;

/**
 * Event names
 */
export const EVENTS = {
  WALLET_CONNECTED: 'wallet:connected',
  WALLET_DISCONNECTED: 'wallet:disconnected',
  NETWORK_CHANGED: 'network:changed',
  ACCOUNT_CHANGED: 'account:changed',
  NFT_MINTED: 'nft:minted',
  ACCESS_GRANTED: 'access:granted',
  ACCESS_REVOKED: 'access:revoked',
} as const;

/**
 * Error codes
 */
export const ERROR_CODES = {
  UNKNOWN: 'UNKNOWN_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NETWORK: 'NETWORK_ERROR',
  CONTRACT: 'CONTRACT_ERROR',
  TRANSACTION: 'TRANSACTION_ERROR',
  WALLET: 'WALLET_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  API: 'API_ERROR',
} as const;

/**
 * NFT metadata standards
 */
export const NFT_METADATA = {
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const,
  SUPPORTED_ANIMATION_TYPES: ['video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav'] as const,
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  GAS_LIMIT_MULTIPLIER: 1.2,
  CONFIRMATION_BLOCKS: 1,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  REQUEST_TIMEOUT: 30000,
} as const;

export default {
  TIME,
  TIME_SECONDS,
  ETH,
  PAGINATION,
  CACHE_DURATION,
  DEBOUNCE,
  ANIMATION,
  BREAKPOINTS,
  FILE_SIZE,
  HTTP_STATUS,
  PATTERNS,
  STORAGE_KEYS,
  EVENTS,
  ERROR_CODES,
  NFT_METADATA,
  DEFAULTS,
};

