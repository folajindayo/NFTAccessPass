/**
 * Analytics Service for tracking user events and metrics
 * Supports multiple analytics providers and custom event tracking
 */

export type EventCategory = 
  | 'wallet'
  | 'nft'
  | 'transaction'
  | 'navigation'
  | 'error'
  | 'engagement';

export interface AnalyticsEvent {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, unknown>;
}

export interface UserProperties {
  walletAddress?: string;
  chainId?: number;
  hasNFT?: boolean;
  accessTier?: string;
  sessionCount?: number;
}

export interface PageView {
  path: string;
  title?: string;
  referrer?: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  providers: {
    google?: { measurementId: string };
    mixpanel?: { token: string };
    amplitude?: { apiKey: string };
    custom?: { endpoint: string };
  };
}

class AnalyticsService {
  private config: AnalyticsConfig;
  private userId: string | null = null;
  private sessionId: string;
  private eventQueue: AnalyticsEvent[] = [];
  private isInitialized = false;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: true,
      debug: false,
      providers: {},
      ...config,
    };
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private log(message: string, data?: unknown): void {
    if (this.config.debug) {
      console.log(`[Analytics] ${message}`, data || '');
    }
  }

  /**
   * Initialize analytics providers
   */
  async initialize(): Promise<void> {
    if (this.isInitialized || !this.config.enabled) return;

    try {
      // Initialize Google Analytics
      if (this.config.providers.google) {
        await this.initializeGA(this.config.providers.google.measurementId);
      }

      this.isInitialized = true;
      this.log('Analytics initialized');

      // Flush queued events
      this.flushQueue();
    } catch (error) {
      this.log('Failed to initialize analytics', error);
    }
  }

  private async initializeGA(measurementId: string): Promise<void> {
    if (typeof window === 'undefined') return;

    // GA4 initialization would go here
    this.log('GA4 initialized', { measurementId });
  }

  /**
   * Set user identity
   */
  identify(userId: string, properties?: UserProperties): void {
    this.userId = userId;
    this.log('User identified', { userId, properties });

    if (!this.config.enabled) return;

    // Send to providers
    this.sendToProviders('identify', { userId, properties });
  }

  /**
   * Track an event
   */
  track(event: AnalyticsEvent): void {
    const enrichedEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.log('Track event', enrichedEvent);

    if (!this.config.enabled) return;

    if (!this.isInitialized) {
      this.eventQueue.push(event);
      return;
    }

    this.sendToProviders('track', enrichedEvent);
  }

  /**
   * Track page view
   */
  pageView(page: PageView): void {
    this.log('Page view', page);

    if (!this.config.enabled) return;

    this.sendToProviders('pageView', {
      ...page,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    });
  }

  /**
   * Track wallet connection
   */
  trackWalletConnect(address: string, chainId: number): void {
    this.track({
      category: 'wallet',
      action: 'connect',
      properties: { address: address.slice(0, 10), chainId },
    });
  }

  /**
   * Track wallet disconnection
   */
  trackWalletDisconnect(): void {
    this.track({
      category: 'wallet',
      action: 'disconnect',
    });
  }

  /**
   * Track NFT mint
   */
  trackMint(tokenId: string, transactionHash: string): void {
    this.track({
      category: 'nft',
      action: 'mint',
      label: tokenId,
      properties: { transactionHash },
    });
  }

  /**
   * Track transaction
   */
  trackTransaction(
    type: 'mint' | 'transfer' | 'approve',
    status: 'pending' | 'success' | 'failed',
    hash?: string
  ): void {
    this.track({
      category: 'transaction',
      action: `${type}_${status}`,
      properties: { hash },
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: string): void {
    this.track({
      category: 'error',
      action: context || 'unknown',
      label: error.message,
      properties: {
        stack: error.stack,
        name: error.name,
      },
    });
  }

  /**
   * Track feature usage
   */
  trackFeature(featureName: string, properties?: Record<string, unknown>): void {
    this.track({
      category: 'engagement',
      action: 'feature_used',
      label: featureName,
      properties,
    });
  }

  private async sendToProviders(type: string, data: unknown): Promise<void> {
    // Send to custom endpoint
    if (this.config.providers.custom) {
      try {
        await fetch(this.config.providers.custom.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, data }),
        });
      } catch (error) {
        this.log('Failed to send to custom provider', error);
      }
    }
  }

  private flushQueue(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.track(event);
      }
    }
  }

  /**
   * Reset analytics state
   */
  reset(): void {
    this.userId = null;
    this.sessionId = this.generateSessionId();
    this.eventQueue = [];
    this.log('Analytics reset');
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.log(`Analytics ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export class for custom instances
export { AnalyticsService };

export default analyticsService;

