/**
 * Debounce and throttle utility functions
 * Helpers for rate-limiting function calls
 */

/**
 * Debounce function type
 */
export interface DebouncedFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
}

/**
 * Throttled function type
 */
export interface ThrottledFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel: () => void;
}

/**
 * Debounce options
 */
export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

/**
 * Create a debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number,
  options: DebounceOptions = {}
): DebouncedFunction<T> {
  const { leading = false, trailing = true, maxWait } = options;
  
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let maxTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime: number | null = null;
  let result: ReturnType<T> | undefined;

  function invokeFunc(): ReturnType<T> | undefined {
    if (lastArgs !== null) {
      result = fn(...lastArgs) as ReturnType<T>;
      lastArgs = null;
    }
    return result;
  }

  function shouldInvoke(time: number): boolean {
    if (lastCallTime === null) return true;
    const timeSinceLastCall = time - lastCallTime;
    return timeSinceLastCall >= wait;
  }

  function startTimer(invokeTime: number): void {
    const remainingWait = wait - (Date.now() - (lastCallTime || 0));
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (trailing && lastArgs) {
        invokeFunc();
        lastCallTime = Date.now();
      }
    }, remainingWait > 0 ? remainingWait : wait);
  }

  function leadingEdge(): void {
    lastCallTime = Date.now();
    if (leading) {
      invokeFunc();
    }
    startTimer(Date.now());

    if (maxWait !== undefined) {
      maxTimeoutId = setTimeout(() => {
        maxTimeoutId = null;
        if (lastArgs) {
          invokeFunc();
          lastCallTime = Date.now();
          startTimer(Date.now());
        }
      }, maxWait);
    }
  }

  function debounced(...args: Parameters<T>): void {
    lastArgs = args;
    const time = Date.now();

    if (timeoutId === null) {
      leadingEdge();
    } else {
      clearTimeout(timeoutId);
      startTimer(time);
    }
  }

  debounced.cancel = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (maxTimeoutId !== null) {
      clearTimeout(maxTimeoutId);
      maxTimeoutId = null;
    }
    lastArgs = null;
    lastCallTime = null;
  };

  debounced.flush = (): void => {
    if (timeoutId !== null && lastArgs) {
      invokeFunc();
      debounced.cancel();
    }
  };

  debounced.pending = (): boolean => {
    return timeoutId !== null;
  };

  return debounced;
}

/**
 * Create a throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): ThrottledFunction<T> {
  const { leading = true, trailing = true } = options;
  
  let lastCallTime: number | null = null;
  let lastArgs: Parameters<T> | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let result: ReturnType<T> | undefined;

  function invokeFunc(): ReturnType<T> | undefined {
    if (lastArgs !== null) {
      result = fn(...lastArgs) as ReturnType<T>;
      lastArgs = null;
    }
    return result;
  }

  function throttled(...args: Parameters<T>): ReturnType<T> | undefined {
    const now = Date.now();
    
    if (lastCallTime === null && !leading) {
      lastCallTime = now;
    }

    const remaining = lastCallTime !== null ? wait - (now - lastCallTime) : 0;

    if (remaining <= 0 || remaining > wait) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCallTime = now;
      lastArgs = args;
      return invokeFunc();
    }

    if (timeoutId === null && trailing) {
      lastArgs = args;
      timeoutId = setTimeout(() => {
        lastCallTime = leading ? Date.now() : null;
        timeoutId = null;
        invokeFunc();
      }, remaining);
    }

    return result;
  }

  throttled.cancel = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastCallTime = null;
    lastArgs = null;
  };

  return throttled;
}

/**
 * Create a rate-limited async function
 */
export function rateLimit<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  requestsPerSecond: number
): T {
  const minInterval = 1000 / requestsPerSecond;
  let lastCallTime = 0;
  const queue: Array<{
    args: Parameters<T>;
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
  }> = [];
  let processing = false;

  async function processQueue(): Promise<void> {
    if (processing || queue.length === 0) return;
    processing = true;

    while (queue.length > 0) {
      const now = Date.now();
      const elapsed = now - lastCallTime;
      
      if (elapsed < minInterval) {
        await new Promise(resolve => setTimeout(resolve, minInterval - elapsed));
      }

      const item = queue.shift();
      if (item) {
        lastCallTime = Date.now();
        try {
          const result = await fn(...item.args);
          item.resolve(result);
        } catch (error) {
          item.reject(error);
        }
      }
    }

    processing = false;
  }

  return ((...args: Parameters<T>): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      queue.push({ args, resolve, reject });
      processQueue();
    });
  }) as T;
}

/**
 * Debounce with promise support
 */
export function debounceAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingPromise: Promise<Awaited<ReturnType<T>>> | null = null;
  let resolve: ((value: Awaited<ReturnType<T>>) => void) | null = null;
  let reject: ((error: unknown) => void) | null = null;

  return (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    if (!pendingPromise) {
      pendingPromise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
    }

    timeoutId = setTimeout(async () => {
      try {
        const result = await fn(...args);
        resolve?.(result as Awaited<ReturnType<T>>);
      } catch (error) {
        reject?.(error);
      } finally {
        pendingPromise = null;
        resolve = null;
        reject = null;
        timeoutId = null;
      }
    }, wait);

    return pendingPromise;
  };
}

/**
 * Create a once-only function
 */
export function once<T extends (...args: unknown[]) => unknown>(fn: T): T {
  let called = false;
  let result: ReturnType<T>;

  return ((...args: Parameters<T>): ReturnType<T> => {
    if (!called) {
      called = true;
      result = fn(...args) as ReturnType<T>;
    }
    return result;
  }) as T;
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  }) as T;
}

