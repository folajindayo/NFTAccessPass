/**
 * Error-related type definitions
 */

/**
 * Error codes
 */
export type ErrorCode =
  // General errors
  | 'UNKNOWN_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'RATE_LIMITED'
  // Wallet errors
  | 'WALLET_NOT_CONNECTED'
  | 'WALLET_CONNECTION_FAILED'
  | 'WALLET_DISCONNECTED'
  | 'WRONG_NETWORK'
  | 'CHAIN_NOT_SUPPORTED'
  // Transaction errors
  | 'USER_REJECTED'
  | 'INSUFFICIENT_FUNDS'
  | 'GAS_ESTIMATION_FAILED'
  | 'TRANSACTION_FAILED'
  | 'TRANSACTION_REVERTED'
  | 'TRANSACTION_TIMEOUT'
  | 'NONCE_TOO_LOW'
  | 'REPLACEMENT_UNDERPRICED'
  // Contract errors
  | 'CONTRACT_NOT_FOUND'
  | 'CONTRACT_CALL_FAILED'
  | 'CONTRACT_EXECUTION_REVERTED'
  | 'INVALID_CONTRACT_ADDRESS'
  // NFT errors
  | 'NFT_NOT_FOUND'
  | 'NFT_NOT_OWNED'
  | 'NFT_ALREADY_MINTED'
  | 'MINT_FAILED'
  | 'MAX_SUPPLY_REACHED'
  | 'MINTING_PAUSED'
  // API errors
  | 'API_ERROR'
  | 'INVALID_RESPONSE'
  | 'SERVICE_UNAVAILABLE';

/**
 * Error severity
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Base error interface
 */
export interface BaseError {
  code: ErrorCode;
  message: string;
  severity: ErrorSeverity;
  timestamp: number;
  details?: Record<string, unknown>;
}

/**
 * App error class
 */
export class AppError extends Error implements BaseError {
  code: ErrorCode;
  severity: ErrorSeverity;
  timestamp: number;
  details?: Record<string, unknown>;
  cause?: Error;

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      severity?: ErrorSeverity;
      details?: Record<string, unknown>;
      cause?: Error;
    }
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = options?.severity || 'medium';
    this.timestamp = Date.now();
    this.details = options?.details;
    this.cause = options?.cause;

    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON(): BaseError {
    return {
      code: this.code,
      message: this.message,
      severity: this.severity,
      timestamp: this.timestamp,
      details: this.details,
    };
  }
}

/**
 * Wallet error
 */
export class WalletError extends AppError {
  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      severity?: ErrorSeverity;
      details?: Record<string, unknown>;
      cause?: Error;
    }
  ) {
    super(code, message, options);
    this.name = 'WalletError';
  }
}

/**
 * Transaction error
 */
export class TransactionError extends AppError {
  hash?: string;

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      severity?: ErrorSeverity;
      details?: Record<string, unknown>;
      cause?: Error;
      hash?: string;
    }
  ) {
    super(code, message, options);
    this.name = 'TransactionError';
    this.hash = options?.hash;
  }
}

/**
 * Contract error
 */
export class ContractError extends AppError {
  contractAddress?: string;
  functionName?: string;

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      severity?: ErrorSeverity;
      details?: Record<string, unknown>;
      cause?: Error;
      contractAddress?: string;
      functionName?: string;
    }
  ) {
    super(code, message, options);
    this.name = 'ContractError';
    this.contractAddress = options?.contractAddress;
    this.functionName = options?.functionName;
  }
}

/**
 * API error
 */
export class ApiError extends AppError {
  statusCode?: number;
  endpoint?: string;

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      severity?: ErrorSeverity;
      details?: Record<string, unknown>;
      cause?: Error;
      statusCode?: number;
      endpoint?: string;
    }
  ) {
    super(code, message, options);
    this.name = 'ApiError';
    this.statusCode = options?.statusCode;
    this.endpoint = options?.endpoint;
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  field?: string;
  value?: unknown;

  constructor(
    message: string,
    options?: {
      details?: Record<string, unknown>;
      field?: string;
      value?: unknown;
    }
  ) {
    super('VALIDATION_ERROR', message, { severity: 'low', details: options?.details });
    this.name = 'ValidationError';
    this.field = options?.field;
    this.value = options?.value;
  }
}

/**
 * Error handler result
 */
export interface ErrorHandlerResult {
  handled: boolean;
  userMessage: string;
  shouldRetry: boolean;
  retryDelay?: number;
}

/**
 * Error context
 */
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  walletAddress?: string;
  chainId?: number;
  extra?: Record<string, unknown>;
}

/**
 * Error report
 */
export interface ErrorReport {
  error: BaseError;
  context: ErrorContext;
  stackTrace?: string;
  browserInfo?: {
    userAgent: string;
    language: string;
    platform: string;
  };
  url?: string;
  timestamp: number;
}

/**
 * Error boundary fallback props
 */
export interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * Type guard for AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard for specific error codes
 */
export function isErrorCode(error: unknown, code: ErrorCode): boolean {
  return isAppError(error) && error.code === code;
}

/**
 * Error message mapping
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  UNKNOWN_ERROR: 'An unexpected error occurred',
  NETWORK_ERROR: 'Network connection failed',
  TIMEOUT_ERROR: 'Request timed out',
  VALIDATION_ERROR: 'Invalid input provided',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  RATE_LIMITED: 'Too many requests',
  WALLET_NOT_CONNECTED: 'Please connect your wallet',
  WALLET_CONNECTION_FAILED: 'Failed to connect wallet',
  WALLET_DISCONNECTED: 'Wallet disconnected',
  WRONG_NETWORK: 'Please switch to the correct network',
  CHAIN_NOT_SUPPORTED: 'This network is not supported',
  USER_REJECTED: 'Transaction was rejected',
  INSUFFICIENT_FUNDS: 'Insufficient funds for transaction',
  GAS_ESTIMATION_FAILED: 'Failed to estimate gas',
  TRANSACTION_FAILED: 'Transaction failed',
  TRANSACTION_REVERTED: 'Transaction was reverted',
  TRANSACTION_TIMEOUT: 'Transaction confirmation timed out',
  NONCE_TOO_LOW: 'Transaction nonce is too low',
  REPLACEMENT_UNDERPRICED: 'Gas price too low to replace transaction',
  CONTRACT_NOT_FOUND: 'Contract not found at address',
  CONTRACT_CALL_FAILED: 'Contract call failed',
  CONTRACT_EXECUTION_REVERTED: 'Contract execution reverted',
  INVALID_CONTRACT_ADDRESS: 'Invalid contract address',
  NFT_NOT_FOUND: 'NFT not found',
  NFT_NOT_OWNED: 'You do not own this NFT',
  NFT_ALREADY_MINTED: 'NFT already minted',
  MINT_FAILED: 'Minting failed',
  MAX_SUPPLY_REACHED: 'Maximum supply reached',
  MINTING_PAUSED: 'Minting is currently paused',
  API_ERROR: 'API request failed',
  INVALID_RESPONSE: 'Invalid response from server',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable',
};

