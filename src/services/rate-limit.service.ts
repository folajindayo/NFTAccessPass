/**
 * Rate Limit Service for API rate limiting
 * Implements token bucket and sliding window algorithms
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  strategy: 'sliding-window' | 'token-bucket';
  onLimitReached?: (key: string) => void;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

interface BucketState {
  tokens: number;
  lastRefill: number;
}

interface WindowState {
  requests: number[];
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60000, // 1 minute
  strategy: 'sliding-window',
};

class RateLimitService {
  private config: RateLimitConfig;
  private buckets: Map<string, BucketState> = new Map();
  private windows: Map<string, WindowState> = new Map();

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if request is allowed
   */
  check(key: string): RateLimitResult {
    if (this.config.strategy === 'token-bucket') {
      return this.checkTokenBucket(key);
    }
    return this.checkSlidingWindow(key);
  }

  /**
   * Consume a request
   */
  consume(key: string, tokens: number = 1): RateLimitResult {
    if (this.config.strategy === 'token-bucket') {
      return this.consumeTokenBucket(key, tokens);
    }
    return this.consumeSlidingWindow(key, tokens);
  }

  /**
   * Token bucket algorithm
   */
  private checkTokenBucket(key: string): RateLimitResult {
    const state = this.getOrCreateBucket(key);
    this.refillBucket(state);

    return {
      allowed: state.tokens > 0,
      remaining: Math.floor(state.tokens),
      resetTime: Date.now() + this.config.windowMs,
      retryAfter: state.tokens > 0 ? undefined : this.calculateRetryAfter(state),
    };
  }

  private consumeTokenBucket(key: string, tokens: number): RateLimitResult {
    const state = this.getOrCreateBucket(key);
    this.refillBucket(state);

    if (state.tokens >= tokens) {
      state.tokens -= tokens;
      return {
        allowed: true,
        remaining: Math.floor(state.tokens),
        resetTime: Date.now() + this.config.windowMs,
      };
    }

    this.config.onLimitReached?.(key);

    return {
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + this.config.windowMs,
      retryAfter: this.calculateRetryAfter(state),
    };
  }

  private getOrCreateBucket(key: string): BucketState {
    let state = this.buckets.get(key);
    
    if (!state) {
      state = {
        tokens: this.config.maxRequests,
        lastRefill: Date.now(),
      };
      this.buckets.set(key, state);
    }

    return state;
  }

  private refillBucket(state: BucketState): void {
    const now = Date.now();
    const elapsed = now - state.lastRefill;
    const refillRate = this.config.maxRequests / this.config.windowMs;
    const tokensToAdd = elapsed * refillRate;

    state.tokens = Math.min(this.config.maxRequests, state.tokens + tokensToAdd);
    state.lastRefill = now;
  }

  private calculateRetryAfter(state: BucketState): number {
    const refillRate = this.config.maxRequests / this.config.windowMs;
    const tokensNeeded = 1 - state.tokens;
    return Math.ceil(tokensNeeded / refillRate);
  }

  /**
   * Sliding window algorithm
   */
  private checkSlidingWindow(key: string): RateLimitResult {
    const state = this.getOrCreateWindow(key);
    this.cleanupWindow(state);

    return {
      allowed: state.requests.length < this.config.maxRequests,
      remaining: this.config.maxRequests - state.requests.length,
      resetTime: state.requests.length > 0 
        ? state.requests[0] + this.config.windowMs 
        : Date.now() + this.config.windowMs,
      retryAfter: state.requests.length >= this.config.maxRequests
        ? state.requests[0] + this.config.windowMs - Date.now()
        : undefined,
    };
  }

  private consumeSlidingWindow(key: string, count: number): RateLimitResult {
    const state = this.getOrCreateWindow(key);
    this.cleanupWindow(state);

    if (state.requests.length + count <= this.config.maxRequests) {
      const now = Date.now();
      for (let i = 0; i < count; i++) {
        state.requests.push(now);
      }

      return {
        allowed: true,
        remaining: this.config.maxRequests - state.requests.length,
        resetTime: state.requests[0] + this.config.windowMs,
      };
    }

    this.config.onLimitReached?.(key);

    return {
      allowed: false,
      remaining: 0,
      resetTime: state.requests[0] + this.config.windowMs,
      retryAfter: state.requests[0] + this.config.windowMs - Date.now(),
    };
  }

  private getOrCreateWindow(key: string): WindowState {
    let state = this.windows.get(key);
    
    if (!state) {
      state = { requests: [] };
      this.windows.set(key, state);
    }

    return state;
  }

  private cleanupWindow(state: WindowState): void {
    const cutoff = Date.now() - this.config.windowMs;
    state.requests = state.requests.filter(time => time > cutoff);
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.buckets.delete(key);
    this.windows.delete(key);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.buckets.clear();
    this.windows.clear();
  }

  /**
   * Get current state for a key
   */
  getState(key: string): RateLimitResult {
    return this.check(key);
  }

  /**
   * Create a rate-limited wrapper for a function
   */
  wrap<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    key: string
  ): T {
    return (async (...args: unknown[]) => {
      const result = this.consume(key);
      
      if (!result.allowed) {
        const error = new Error('Rate limit exceeded');
        (error as Error & { retryAfter: number }).retryAfter = result.retryAfter || 0;
        throw error;
      }

      return fn(...args);
    }) as T;
  }

  /**
   * Create middleware for Express-style handlers
   */
  middleware(keyFn: (req: unknown) => string) {
    return async (req: unknown, res: { status: (code: number) => { json: (data: unknown) => void } }, next: () => void) => {
      const key = keyFn(req);
      const result = this.consume(key);

      if (!result.allowed) {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: result.retryAfter,
        });
      }

      next();
    };
  }
}

// Preset configurations
export const RateLimitPresets = {
  api: { maxRequests: 100, windowMs: 60000 },
  strict: { maxRequests: 10, windowMs: 60000 },
  lenient: { maxRequests: 1000, windowMs: 60000 },
  perSecond: { maxRequests: 10, windowMs: 1000 },
  perMinute: { maxRequests: 60, windowMs: 60000 },
  perHour: { maxRequests: 3600, windowMs: 3600000 },
};

// Export singleton instance with default config
export const rateLimitService = new RateLimitService();

// Export class for custom instances
export { RateLimitService };

export default rateLimitService;

