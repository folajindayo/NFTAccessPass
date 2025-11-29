/**
 * Configuration-related type definitions
 */

import type { Address } from 'viem';
import type { ChainId } from './chain.types';

/**
 * Environment
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Feature flags
 */
export interface FeatureFlags {
  enableTestnets: boolean;
  enableAnalytics: boolean;
  enableMinting: boolean;
  enableTransfers: boolean;
  enableBridging: boolean;
  enableStaking: boolean;
  maintenanceMode: boolean;
  debugMode: boolean;
}

/**
 * App configuration
 */
export interface AppConfig {
  name: string;
  version: string;
  environment: Environment;
  baseUrl: string;
  apiUrl: string;
  features: FeatureFlags;
  contracts: ContractConfig;
  chains: ChainConfig;
  wallet: WalletConfig;
  services: ServiceConfig;
  ui: UIConfig;
}

/**
 * Contract configuration
 */
export interface ContractConfig {
  accessPass: Record<ChainId, Address>;
  multicall: Record<ChainId, Address>;
  ensRegistry?: Address;
}

/**
 * Chain configuration for app
 */
export interface ChainConfig {
  defaultChainId: ChainId;
  supportedChainIds: ChainId[];
  testnetChainIds: ChainId[];
  rpcUrls: Record<ChainId, string[]>;
}

/**
 * Wallet configuration
 */
export interface WalletConfig {
  walletConnectProjectId: string;
  appName: string;
  appDescription: string;
  appUrl: string;
  appIcon: string;
  autoConnect: boolean;
  reconnectOnMount: boolean;
}

/**
 * Service configuration
 */
export interface ServiceConfig {
  alchemy: {
    apiKey: string;
    network: string;
  };
  ipfs: {
    gateway: string;
    pinataApiKey?: string;
    pinataSecretKey?: string;
  };
  analytics?: {
    googleAnalyticsId?: string;
    mixpanelToken?: string;
  };
}

/**
 * UI configuration
 */
export interface UIConfig {
  theme: 'light' | 'dark' | 'system';
  locale: string;
  dateFormat: string;
  numberFormat: string;
  animations: boolean;
  compactMode: boolean;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message: string;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  storageType: 'memory' | 'localStorage' | 'sessionStorage';
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryCondition?: (error: Error) => boolean;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error' | 'silent';
  format: 'json' | 'pretty';
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
}

/**
 * Security configuration
 */
export interface SecurityConfig {
  enableCSRF: boolean;
  allowedOrigins: string[];
  rateLimiting: RateLimitConfig;
  contentSecurityPolicy?: string;
}

/**
 * Build configuration
 */
export interface BuildConfig {
  analyze: boolean;
  sourceMaps: boolean;
  minify: boolean;
  compress: boolean;
}

/**
 * Environment variables
 */
export interface EnvVars {
  NEXT_PUBLIC_CONTRACT_ADDRESS: string;
  NEXT_PUBLIC_CHAIN_ID: string;
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: string;
  NEXT_PUBLIC_ALCHEMY_API_KEY?: string;
  NEXT_PUBLIC_IPFS_GATEWAY?: string;
  PRIVATE_KEY?: string;
  RPC_URL?: string;
}

/**
 * Configuration loader
 */
export interface ConfigLoader {
  load(): Promise<AppConfig>;
  get<K extends keyof AppConfig>(key: K): AppConfig[K];
  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void;
  reload(): Promise<void>;
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
  }>;
}

/**
 * Dynamic config
 */
export interface DynamicConfig {
  lastUpdated: number;
  values: Record<string, unknown>;
  source: 'remote' | 'local' | 'default';
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    foreground: string;
  };
  fonts: {
    sans: string;
    mono: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

/**
 * Localization config
 */
export interface LocalizationConfig {
  defaultLocale: string;
  supportedLocales: string[];
  fallbackLocale: string;
  loadPath: string;
}

