/**
 * Cache Service for in-memory caching with TTL support
 * Provides LRU eviction and automatic expiration
 */

export interface CacheEntry<T> {
  value: T;
  expiry: number;
  lastAccessed: number;
  hits: number;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  oldestEntry: number | null;
  newestEntry: number | null;
}

const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 1000,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  cleanupInterval: 60 * 1000, // 1 minute
};

class CacheService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private config: CacheConfig;
  private stats = { hits: 0, misses: 0 };
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startCleanup();
  }

  private startCleanup(): void {
    if (typeof window === 'undefined') return;

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();
    let deleted = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < now) {
        this.cache.delete(key);
        deleted++;
      }
    }

    // Evict least recently accessed if over max size
    while (this.cache.size > this.config.maxSize) {
      const lruKey = this.findLRUKey();
      if (lruKey) {
        this.cache.delete(lruKey);
        deleted++;
      } else {
        break;
      }
    }
  }

  private findLRUKey(): string | null {
    let lruKey: string | null = null;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    return lruKey;
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (entry.expiry < Date.now()) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    entry.lastAccessed = Date.now();
    entry.hits++;
    this.stats.hits++;

    return entry.value;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.config.defaultTTL);

    this.cache.set(key, {
      value,
      expiry,
      lastAccessed: Date.now(),
      hits: 0,
    });

    // Trigger cleanup if over size
    if (this.cache.size > this.config.maxSize) {
      this.cleanup();
    }
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (entry.expiry < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Delete keys matching a pattern
   */
  deletePattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let deleted = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Get or set with factory function
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    let oldest: number | null = null;
    let newest: number | null = null;

    for (const entry of this.cache.values()) {
      if (oldest === null || entry.lastAccessed < oldest) {
        oldest = entry.lastAccessed;
      }
      if (newest === null || entry.lastAccessed > newest) {
        newest = entry.lastAccessed;
      }
    }

    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      oldestEntry: oldest,
      newestEntry: newest,
    };
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Update TTL for existing key
   */
  touch(key: string, ttl?: number): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    entry.expiry = Date.now() + (ttl || this.config.defaultTTL);
    entry.lastAccessed = Date.now();
    return true;
  }

  /**
   * Get remaining TTL for a key
   */
  ttl(key: string): number | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const remaining = entry.expiry - Date.now();
    return remaining > 0 ? remaining : null;
  }

  /**
   * Destroy the cache service
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Export class for custom instances
export { CacheService };

// Helper to create namespaced cache keys
export function createCacheKey(...parts: (string | number)[]): string {
  return parts.join(':');
}

export default cacheService;

