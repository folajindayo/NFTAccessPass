/**
 * Analytics Service
 * Track and analyze NFT access events
 */

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: Date;
  userId?: string;
  walletAddress?: string;
  properties: Record<string, unknown>;
  sessionId?: string;
  platform?: string;
  version?: string;
}

export type AnalyticsEventType =
  | 'page_view'
  | 'wallet_connect'
  | 'wallet_disconnect'
  | 'nft_mint_started'
  | 'nft_mint_completed'
  | 'nft_mint_failed'
  | 'access_granted'
  | 'access_denied'
  | 'token_transfer'
  | 'error';

export interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers24h: number;
  totalMints: number;
  mintSuccessRate: number;
  accessGranted: number;
  accessDenied: number;
  averageSessionDuration: number;
}

export interface EventFilter {
  type?: AnalyticsEventType | AnalyticsEventType[];
  startDate?: Date;
  endDate?: Date;
  walletAddress?: string;
  limit?: number;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessions: Map<string, { startTime: Date; lastActivity: Date }> = new Map();
  private isEnabled: boolean = true;

  trackEvent(
    type: AnalyticsEventType,
    properties: Record<string, unknown> = {},
    walletAddress?: string
  ): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date(),
      walletAddress,
      properties,
      sessionId: this.getCurrentSessionId(),
      platform: typeof window !== 'undefined' ? 'web' : 'server',
      version: '1.0.0',
    };

    this.events.push(event);
    this.updateSession();

    // In production, send to analytics backend
    this.sendToBackend(event);
  }

  trackPageView(path: string, title?: string): void {
    this.trackEvent('page_view', { path, title });
  }

  trackWalletConnect(address: string, chainId: number): void {
    this.trackEvent('wallet_connect', { chainId }, address);
  }

  trackWalletDisconnect(address: string): void {
    this.trackEvent('wallet_disconnect', {}, address);
  }

  trackMintStarted(address: string, tokenId?: string, amount?: number): void {
    this.trackEvent('nft_mint_started', { tokenId, amount }, address);
  }

  trackMintCompleted(
    address: string,
    tokenId: string,
    transactionHash: string,
    gasUsed?: bigint
  ): void {
    this.trackEvent('nft_mint_completed', {
      tokenId,
      transactionHash,
      gasUsed: gasUsed?.toString(),
    }, address);
  }

  trackMintFailed(address: string, error: string, tokenId?: string): void {
    this.trackEvent('nft_mint_failed', { error, tokenId }, address);
  }

  trackAccessGranted(address: string, tierLevel: string, tokenCount: number): void {
    this.trackEvent('access_granted', { tierLevel, tokenCount }, address);
  }

  trackAccessDenied(address: string, reason: string): void {
    this.trackEvent('access_denied', { reason }, address);
  }

  trackError(error: Error, context?: Record<string, unknown>): void {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }

  async getEvents(filter: EventFilter = {}): Promise<AnalyticsEvent[]> {
    let filtered = [...this.events];

    if (filter.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type];
      filtered = filtered.filter(e => types.includes(e.type));
    }

    if (filter.startDate) {
      filtered = filtered.filter(e => e.timestamp >= filter.startDate!);
    }

    if (filter.endDate) {
      filtered = filtered.filter(e => e.timestamp <= filter.endDate!);
    }

    if (filter.walletAddress) {
      filtered = filtered.filter(e => 
        e.walletAddress?.toLowerCase() === filter.walletAddress!.toLowerCase()
      );
    }

    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filter.limit) {
      filtered = filtered.slice(0, filter.limit);
    }

    return filtered;
  }

  async getMetrics(period: 'day' | 'week' | 'month' = 'day'): Promise<AnalyticsMetrics> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const periodEvents = this.events.filter(e => e.timestamp >= startDate);

    const uniqueUsers = new Set(
      periodEvents
        .map(e => e.walletAddress)
        .filter(Boolean)
    );

    const mintEvents = periodEvents.filter(e => e.type.startsWith('nft_mint'));
    const completedMints = mintEvents.filter(e => e.type === 'nft_mint_completed').length;
    const failedMints = mintEvents.filter(e => e.type === 'nft_mint_failed').length;

    const accessGranted = periodEvents.filter(e => e.type === 'access_granted').length;
    const accessDenied = periodEvents.filter(e => e.type === 'access_denied').length;

    return {
      totalUsers: uniqueUsers.size,
      activeUsers24h: this.getActiveUsers24h(),
      totalMints: completedMints + failedMints,
      mintSuccessRate: completedMints + failedMints > 0
        ? (completedMints / (completedMints + failedMints)) * 100
        : 100,
      accessGranted,
      accessDenied,
      averageSessionDuration: this.calculateAverageSessionDuration(),
    };
  }

  async getEventsByWallet(address: string): Promise<AnalyticsEvent[]> {
    return this.getEvents({ walletAddress: address });
  }

  async getMintFunnel(): Promise<{
    started: number;
    completed: number;
    failed: number;
    conversionRate: number;
  }> {
    const started = this.events.filter(e => e.type === 'nft_mint_started').length;
    const completed = this.events.filter(e => e.type === 'nft_mint_completed').length;
    const failed = this.events.filter(e => e.type === 'nft_mint_failed').length;

    return {
      started,
      completed,
      failed,
      conversionRate: started > 0 ? (completed / started) * 100 : 0,
    };
  }

  async getPopularPages(limit: number = 10): Promise<{ path: string; views: number }[]> {
    const pageViews = this.events.filter(e => e.type === 'page_view');
    const counts = new Map<string, number>();

    for (const event of pageViews) {
      const path = event.properties.path as string;
      counts.set(path, (counts.get(path) || 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  clearEvents(): void {
    this.events = [];
    this.sessions.clear();
  }

  private getCurrentSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
      this.sessions.set(sessionId, {
        startTime: new Date(),
        lastActivity: new Date(),
      });
    }
    return sessionId;
  }

  private updateSession(): void {
    const sessionId = this.getCurrentSessionId();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
    }
  }

  private getActiveUsers24h(): number {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeWallets = new Set(
      this.events
        .filter(e => e.timestamp >= cutoff && e.walletAddress)
        .map(e => e.walletAddress)
    );
    return activeWallets.size;
  }

  private calculateAverageSessionDuration(): number {
    const durations: number[] = [];
    
    for (const session of this.sessions.values()) {
      const duration = session.lastActivity.getTime() - session.startTime.getTime();
      durations.push(duration);
    }

    if (durations.length === 0) return 0;
    return durations.reduce((a, b) => a + b, 0) / durations.length / 1000; // seconds
  }

  private async sendToBackend(event: AnalyticsEvent): Promise<void> {
    // In production, send to analytics service
    // console.log('Analytics event:', event);
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
