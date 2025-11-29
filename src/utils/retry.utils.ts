/**
 * Retry utility functions
 * Helpers for retrying operations with various strategies
 */

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  factor: number;
  jitter: boolean;
  retryOn?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number, delay: number) => void;
}

export interface RetryResult<T> {
  success: boolean;
  value?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  factor: 2,
  jitter: true,
};

/**
 * Calculate delay with exponential backoff
 */
export function calculateBackoff(
  attempt: number,
  baseDelay: number,
  factor: number,
  maxDelay: number,
  jitter: boolean
): number {
  let delay = baseDelay * Math.pow(factor, attempt);
  delay = Math.min(delay, maxDelay);
  
  if (jitter) {
    // Add random jitter between 0-25%
    delay = delay * (1 + Math.random() * 0.25);
  }
  
  return Math.floor(delay);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (opts.retryOn && !opts.retryOn(lastError, attempt)) {
        throw lastError;
      }

      // Don't wait after last attempt
      if (attempt < opts.maxAttempts - 1) {
        const delay = calculateBackoff(
          attempt,
          opts.baseDelay,
          opts.factor,
          opts.maxDelay,
          opts.jitter
        );

        opts.onRetry?.(lastError, attempt + 1, delay);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Retry with detailed result
 */
export async function retryWithResult<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<RetryResult<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();
  let attempts = 0;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    attempts++;
    try {
      const value = await operation();
      return {
        success: true,
        value,
        attempts,
        totalTime: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (opts.retryOn && !opts.retryOn(lastError, attempt)) {
        break;
      }

      if (attempt < opts.maxAttempts - 1) {
        const delay = calculateBackoff(
          attempt,
          opts.baseDelay,
          opts.factor,
          opts.maxDelay,
          opts.jitter
        );

        opts.onRetry?.(lastError, attempt + 1, delay);
        await sleep(delay);
      }
    }
  }

  return {
    success: false,
    error: lastError || new Error('Retry failed'),
    attempts,
    totalTime: Date.now() - startTime,
  };
}

/**
 * Create a retryable version of a function
 */
export function withRetry<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: Partial<RetryOptions> = {}
): T {
  return (async (...args: unknown[]) => {
    return retry(() => fn(...args), options);
  }) as T;
}

/**
 * Retry until condition is met
 */
export async function retryUntil<T>(
  operation: () => Promise<T>,
  condition: (result: T) => boolean,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    const result = await operation();
    
    if (condition(result)) {
      return result;
    }

    if (attempt < opts.maxAttempts - 1) {
      const delay = calculateBackoff(
        attempt,
        opts.baseDelay,
        opts.factor,
        opts.maxDelay,
        opts.jitter
      );

      await sleep(delay);
    }
  }

  throw new Error('Condition not met after retries');
}

/**
 * Check if error is retryable (network errors, rate limits)
 */
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  
  // Network errors
  if (message.includes('network') || 
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('fetch failed')) {
    return true;
  }

  // Rate limit errors
  if (message.includes('rate limit') || 
      message.includes('429') ||
      message.includes('too many requests')) {
    return true;
  }

  // Server errors
  if (message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504')) {
    return true;
  }

  return false;
}

/**
 * Check if error should not be retried
 */
export function isNonRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  
  // User rejections
  if (message.includes('user rejected') ||
      message.includes('user denied')) {
    return true;
  }

  // Invalid data
  if (message.includes('invalid') ||
      message.includes('malformed')) {
    return true;
  }

  // Authentication errors
  if (message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('401') ||
      message.includes('403')) {
    return true;
  }

  return false;
}

/**
 * Create retry policy
 */
export function createRetryPolicy(
  maxAttempts: number,
  baseDelay: number
): Partial<RetryOptions> {
  return {
    maxAttempts,
    baseDelay,
    retryOn: (error) => isRetryableError(error) && !isNonRetryableError(error),
  };
}

/**
 * Preset retry policies
 */
export const RetryPolicies = {
  default: createRetryPolicy(3, 1000),
  aggressive: { maxAttempts: 5, baseDelay: 500, factor: 1.5 },
  patient: { maxAttempts: 10, baseDelay: 2000, factor: 2 },
  quick: { maxAttempts: 2, baseDelay: 100, factor: 2 },
  none: { maxAttempts: 1, baseDelay: 0 },
};

