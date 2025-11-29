/**
 * Type exports
 * Central export file for all type definitions
 */

// API types
export * from './api';

// Chain types
export * from './chain.types';

// Component types
export * from './components';

// Config types
export * from './config.types';

// Contract types
export * from './contract.types';

// Error types
export * from './error.types';

// Event types
export * from './event.types';

// NFT types
export * from './nft.types';

// Transaction types
export * from './transaction.types';

// UI types
export * from './ui.types';

// Wallet types
export * from './wallet.types';

// Re-export commonly used types for convenience
export type {
  // Chain
  ChainId,
  ChainConfig,
  NetworkType,
} from './chain.types';

export type {
  // NFT
  NFTToken,
  NFTMetadata,
  NFTAttribute,
  NFTCollection,
  AccessTier,
} from './nft.types';

export type {
  // Transaction
  TransactionStatus,
  TransactionType,
  TransactionReceipt,
  GasEstimate,
} from './transaction.types';

export type {
  // Wallet
  WalletConnection,
  WalletProvider,
  WalletBalance,
  WalletAccount,
} from './wallet.types';

export type {
  // Contract
  ContractInfo,
  ContractReadParams,
  ContractWriteParams,
} from './contract.types';

export type {
  // Error
  ErrorCode,
  ErrorSeverity,
  BaseError,
} from './error.types';

export {
  // Error classes
  AppError,
  WalletError,
  TransactionError,
  ContractError,
  ApiError,
  ValidationError,
  isAppError,
  isErrorCode,
  ERROR_MESSAGES,
} from './error.types';

export type {
  // Config
  AppConfig,
  FeatureFlags,
  Environment,
} from './config.types';

export type {
  // UI
  Size,
  ColorVariant,
  ButtonProps,
  ModalProps,
  ToastProps,
} from './ui.types';

export type {
  // Events
  BlockchainEvent,
  EventFilter,
  EventSubscription,
} from './event.types';
