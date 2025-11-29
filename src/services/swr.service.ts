/**
 * Stale-While-Revalidate Service
 * Implements SWR pattern for data fetching
 */

export interface SWRCacheEntry<T> {
  data: T;
  timestamp: number;
  isStale: boolean;
}

export interface SWROptions {
  /**
   * Time before data is considered stale (ms)
   */
  staleTime?: number;
  /**
   * Time before cache entry is removed (ms)
   */
  cacheTime?: number;
  /**
   * Revalidate on window focus
   */
  revalidateOnFocus?: boolean;
  /**
   * Revalidate on network reconnect
   */
  revalidateOnReconnect?: boolean;
  /**
   * Retry count on error
   */
  retryCount?: number;
  /**
   * Retry delay (ms)
   */
  retryDelay?: number;
}

const DEFAULT_OPTIONS: Required<SWROptions> = {
  staleTime: 5000, // 5 seconds
  cacheTime: 300000, // 5 minutes
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  retryCount: 3,
  retryDelay: 1000,
};

type Listener<T> = (data: T | null, error: Error | null, isLoading: boolean) => void;

/**
 * SWR Cache manager
 */
class SWRCache {
  private cache: Map<string, SWRCacheEntry<unknown>> = new Map();
  private pending: Map<string, Promise<unknown>> = new Map();
  private listeners: Map<string, Set<Listener<unknown>>> = new Map();
  private options: Required<SWROptions>;

  constructor(options: SWROptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    if (this.options.revalidateOnFocus) {
      window.addEventListener('focus', () => this.revalidateAll());
    }

    if (this.options.revalidateOnReconnect) {
      window.addEventListener('online', () => this.revalidateAll());
    }
  }

  /**
   * Get cached data or fetch
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: SWROptions = {}
  ): Promise<T> {
    const opts = { ...this.options, ...options };
    const cached = this.cache.get(key) as SWRCacheEntry<T> | undefined;

    // Return cached data if fresh
    if (cached && !this.isStale(cached, opts.staleTime)) {
      return cached.data;
    }

    // Return stale data while revalidating
    if (cached?.isStale) {
      this.revalidate(key, fetcher, opts);
      return cached.data;
    }

    // Fetch new data
    return this.fetchAndCache(key, fetcher, opts);
  }

  /**
   * Check if entry is stale
   */
  private isStale(entry: SWRCacheEntry<unknown>, staleTime: number): boolean {
    return Date.now() - entry.timestamp > staleTime;
  }

  /**
   * Fetch and cache data
   */
  private async fetchAndCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: Required<SWROptions>
  ): Promise<T> {
    // Check for pending request
    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<T>;
    }

    const promise = this.fetchWithRetry(fetcher, options.retryCount, options.retryDelay);
    this.pending.set(key, promise);
    this.notifyListeners(key, null, null, true);

    try {
      const data = await promise;
      
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        isStale: false,
      });

      // Schedule cache cleanup
      setTimeout(() => {
        this.cache.delete(key);
      }, options.cacheTime);

      this.notifyListeners(key, data, null, false);
      return data;
    } catch (error) {
      this.notifyListeners(key, null, error as Error, false);
      throw error;
    } finally {
      this.pending.delete(key);
    }
  }

  /**
   * Fetch with retry logic
   */
  private async fetchWithRetry<T>(
    fetcher: () => Promise<T>,
    retries: number,
    delay: number
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        return await fetcher();
      } catch (error) {
        lastError = error as Error;
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }

    throw lastError;
  }

  /**
   * Revalidate a specific key
   */
  async revalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: Required<SWROptions> = this.options
  ): Promise<void> {
    const cached = this.cache.get(key);
    if (cached) {
      cached.isStale = true;
    }

    try {
      await this.fetchAndCache(key, fetcher, options);
    } catch {
      // Silently fail revalidation
    }
  }

  /**
   * Revalidate all cached entries
   */
  private revalidateAll(): void {
    this.cache.forEach((entry, key) => {
      entry.isStale = true;
    });
  }

  /**
   * Subscribe to changes
   */
  subscribe<T>(
    key: string,
    listener: Listener<T>
  ): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key)!.add(listener as Listener<unknown>);

    // Return unsubscribe function
    return () => {
      this.listeners.get(key)?.delete(listener as Listener<unknown>);
    };
  }

  /**
   * Notify listeners of changes
   */
  private notifyListeners<T>(
    key: string,
    data: T | null,
    error: Error | null,
    isLoading: boolean
  ): void {
    this.listeners.get(key)?.forEach(listener => {
      listener(data, error, isLoading);
    });
  }

  /**
   * Mutate cache directly
   */
  mutate<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      isStale: false,
    });
    this.notifyListeners(key, data, null, false);
  }

  /**
   * Delete cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.pending.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.pending.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    keys: string[];
    pendingCount: number;
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      pendingCount: this.pending.size,
    };
  }
}

// Global SWR cache instance
export const swrCache = new SWRCache();

/**
 * Create a scoped SWR cache
 */
export function createSWRCache(options?: SWROptions): SWRCache {
  return new SWRCache(options);
}

export default swrCache;

