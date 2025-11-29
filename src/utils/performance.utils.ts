/**
 * Performance Utilities
 * Helpers for performance optimization
 */

/**
 * Request deduplication cache
 */
const requestCache = new Map<string, Promise<any>>();
const requestTimestamps = new Map<string, number>();
const DEFAULT_CACHE_TTL = 5000; // 5 seconds

/**
 * Deduplicate concurrent requests to the same endpoint
 */
export function deduplicateRequest<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_CACHE_TTL
): Promise<T> {
  const now = Date.now();
  const timestamp = requestTimestamps.get(key);
  
  // Check if cached request is still valid
  if (timestamp && now - timestamp < ttl && requestCache.has(key)) {
    return requestCache.get(key) as Promise<T>;
  }
  
  // Create new request
  const request = fetcher()
    .finally(() => {
      // Clear cache after TTL
      setTimeout(() => {
        requestCache.delete(key);
        requestTimestamps.delete(key);
      }, ttl);
    });
  
  requestCache.set(key, request);
  requestTimestamps.set(key, now);
  
  return request;
}

/**
 * Clear all cached requests
 */
export function clearRequestCache(): void {
  requestCache.clear();
  requestTimestamps.clear();
}

/**
 * Batch multiple calls into a single execution
 */
export function createBatcher<TInput, TOutput>(
  executor: (items: TInput[]) => Promise<TOutput[]>,
  options: {
    maxBatchSize?: number;
    delayMs?: number;
  } = {}
): (item: TInput) => Promise<TOutput> {
  const { maxBatchSize = 10, delayMs = 10 } = options;
  
  let batch: Array<{
    item: TInput;
    resolve: (value: TOutput) => void;
    reject: (error: Error) => void;
  }> = [];
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  async function executeBatch() {
    const currentBatch = batch;
    batch = [];
    timeout = null;
    
    try {
      const items = currentBatch.map(b => b.item);
      const results = await executor(items);
      
      currentBatch.forEach((b, index) => {
        if (results[index] !== undefined) {
          b.resolve(results[index]);
        } else {
          b.reject(new Error('No result for batch item'));
        }
      });
    } catch (error) {
      currentBatch.forEach(b => b.reject(error as Error));
    }
  }
  
  return (item: TInput): Promise<TOutput> => {
    return new Promise((resolve, reject) => {
      batch.push({ item, resolve, reject });
      
      if (batch.length >= maxBatchSize) {
        if (timeout) {
          clearTimeout(timeout);
        }
        executeBatch();
      } else if (!timeout) {
        timeout = setTimeout(executeBatch, delayMs);
      }
    });
  };
}

/**
 * LRU Cache implementation
 */
export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }
    
    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Delete least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * Measure function execution time
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  log: boolean = false
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  if (log) {
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }
  
  return { result, duration };
}

/**
 * Measure sync function execution time
 */
export function measureSync<T>(
  name: string,
  fn: () => T,
  log: boolean = false
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  if (log) {
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }
  
  return { result, duration };
}

/**
 * Create a prefetch function for likely next navigations
 */
export function createPrefetcher(
  urls: string[],
  options: { priority?: 'high' | 'low' | 'auto' } = {}
): () => void {
  const { priority = 'low' } = options;
  
  return () => {
    if (typeof window === 'undefined') return;
    
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'document';
      
      if (priority !== 'auto') {
        link.setAttribute('importance', priority);
      }
      
      document.head.appendChild(link);
    });
  };
}

/**
 * Idle callback wrapper with fallback
 */
export function requestIdleCallbackPolyfill(
  callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void,
  options?: { timeout?: number }
): number {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  
  // Fallback for browsers without requestIdleCallback
  const start = Date.now();
  return window.setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, 1) as unknown as number;
}

/**
 * Cancel idle callback
 */
export function cancelIdleCallbackPolyfill(id: number): void {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    window.clearTimeout(id);
  }
}

export default {
  deduplicateRequest,
  clearRequestCache,
  createBatcher,
  LRUCache,
  measureAsync,
  measureSync,
  createPrefetcher,
  requestIdleCallbackPolyfill,
  cancelIdleCallbackPolyfill,
};

