/**
 * Price Service for token and gas pricing
 * Fetches real-time prices from multiple sources
 */

export interface TokenPrice {
  symbol: string;
  priceUsd: number;
  priceChange24h: number;
  lastUpdated: number;
}

export interface GasPrice {
  slow: bigint;
  standard: bigint;
  fast: bigint;
  instant: bigint;
  baseFee: bigint;
  lastBlock: number;
}

export interface PriceConfig {
  updateInterval: number;
  cacheTime: number;
  providers: {
    coingecko?: boolean;
    chainlink?: boolean;
  };
}

const DEFAULT_CONFIG: PriceConfig = {
  updateInterval: 60000, // 1 minute
  cacheTime: 30000, // 30 seconds
  providers: {
    coingecko: true,
  },
};

const TOKEN_IDS: Record<string, string> = {
  ETH: 'ethereum',
  MATIC: 'matic-network',
  BNB: 'binancecoin',
  AVAX: 'avalanche-2',
  ARB: 'arbitrum',
  OP: 'optimism',
};

class PriceService {
  private config: PriceConfig;
  private priceCache: Map<string, { price: TokenPrice; timestamp: number }> = new Map();
  private gasCache: Map<number, { gas: GasPrice; timestamp: number }> = new Map();
  private updateTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<PriceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get token price in USD
   */
  async getTokenPrice(symbol: string): Promise<TokenPrice | null> {
    const cacheKey = symbol.toUpperCase();
    const cached = this.priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.config.cacheTime) {
      return cached.price;
    }

    try {
      const price = await this.fetchTokenPrice(symbol);
      if (price) {
        this.priceCache.set(cacheKey, { price, timestamp: Date.now() });
      }
      return price;
    } catch {
      return cached?.price || null;
    }
  }

  /**
   * Get multiple token prices
   */
  async getTokenPrices(symbols: string[]): Promise<Map<string, TokenPrice>> {
    const results = new Map<string, TokenPrice>();
    
    // Filter out cached prices
    const toFetch: string[] = [];
    
    for (const symbol of symbols) {
      const cached = this.priceCache.get(symbol.toUpperCase());
      if (cached && Date.now() - cached.timestamp < this.config.cacheTime) {
        results.set(symbol, cached.price);
      } else {
        toFetch.push(symbol);
      }
    }

    // Batch fetch remaining
    if (toFetch.length > 0) {
      const fetched = await this.fetchMultipleTokenPrices(toFetch);
      fetched.forEach((price, symbol) => {
        results.set(symbol, price);
        this.priceCache.set(symbol.toUpperCase(), { price, timestamp: Date.now() });
      });
    }

    return results;
  }

  private async fetchTokenPrice(symbol: string): Promise<TokenPrice | null> {
    const tokenId = TOKEN_IDS[symbol.toUpperCase()];
    if (!tokenId) return null;

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd&include_24hr_change=true`
    );

    if (!response.ok) return null;

    const data = await response.json();
    const tokenData = data[tokenId];

    if (!tokenData) return null;

    return {
      symbol: symbol.toUpperCase(),
      priceUsd: tokenData.usd,
      priceChange24h: tokenData.usd_24h_change || 0,
      lastUpdated: Date.now(),
    };
  }

  private async fetchMultipleTokenPrices(symbols: string[]): Promise<Map<string, TokenPrice>> {
    const results = new Map<string, TokenPrice>();
    const tokenIds = symbols
      .map(s => TOKEN_IDS[s.toUpperCase()])
      .filter(Boolean)
      .join(',');

    if (!tokenIds) return results;

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds}&vs_currencies=usd&include_24hr_change=true`
      );

      if (!response.ok) return results;

      const data = await response.json();

      for (const symbol of symbols) {
        const tokenId = TOKEN_IDS[symbol.toUpperCase()];
        const tokenData = data[tokenId];

        if (tokenData) {
          results.set(symbol, {
            symbol: symbol.toUpperCase(),
            priceUsd: tokenData.usd,
            priceChange24h: tokenData.usd_24h_change || 0,
            lastUpdated: Date.now(),
          });
        }
      }
    } catch {
      // Return empty map on error
    }

    return results;
  }

  /**
   * Get gas prices for a chain
   */
  async getGasPrice(chainId: number): Promise<GasPrice | null> {
    const cached = this.gasCache.get(chainId);
    
    if (cached && Date.now() - cached.timestamp < 15000) { // 15 second cache
      return cached.gas;
    }

    try {
      const gas = await this.fetchGasPrice(chainId);
      if (gas) {
        this.gasCache.set(chainId, { gas, timestamp: Date.now() });
      }
      return gas;
    } catch {
      return cached?.gas || null;
    }
  }

  private async fetchGasPrice(chainId: number): Promise<GasPrice | null> {
    try {
      const response = await fetch(`/api/gas?chainId=${chainId}`);
      
      if (!response.ok) {
        return this.getDefaultGasPrice(chainId);
      }

      const data = await response.json();
      
      return {
        slow: BigInt(data.slow || '10000000000'),
        standard: BigInt(data.standard || '15000000000'),
        fast: BigInt(data.fast || '20000000000'),
        instant: BigInt(data.instant || '30000000000'),
        baseFee: BigInt(data.baseFee || '10000000000'),
        lastBlock: data.lastBlock || 0,
      };
    } catch {
      return this.getDefaultGasPrice(chainId);
    }
  }

  private getDefaultGasPrice(chainId: number): GasPrice {
    const defaults: Record<number, bigint> = {
      1: 20000000000n,   // Ethereum: 20 gwei
      137: 50000000000n, // Polygon: 50 gwei
      42161: 100000000n, // Arbitrum: 0.1 gwei
      10: 1000000n,      // Optimism: 0.001 gwei
      8453: 1000000n,    // Base: 0.001 gwei
    };

    const base = defaults[chainId] || 20000000000n;

    return {
      slow: (base * 80n) / 100n,
      standard: base,
      fast: (base * 120n) / 100n,
      instant: (base * 150n) / 100n,
      baseFee: base,
      lastBlock: 0,
    };
  }

  /**
   * Convert wei to USD
   */
  async weiToUsd(wei: bigint, chainId: number = 1): Promise<number> {
    const symbol = this.getChainSymbol(chainId);
    const price = await this.getTokenPrice(symbol);
    
    if (!price) return 0;

    const eth = Number(wei) / 1e18;
    return eth * price.priceUsd;
  }

  private getChainSymbol(chainId: number): string {
    const symbols: Record<number, string> = {
      1: 'ETH',
      137: 'MATIC',
      56: 'BNB',
      43114: 'AVAX',
      42161: 'ETH',
      10: 'ETH',
      8453: 'ETH',
    };

    return symbols[chainId] || 'ETH';
  }

  /**
   * Clear price cache
   */
  clearCache(): void {
    this.priceCache.clear();
    this.gasCache.clear();
  }

  /**
   * Destroy service
   */
  destroy(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    this.clearCache();
  }
}

// Export singleton instance
export const priceService = new PriceService();

// Export class for custom instances
export { PriceService };

export default priceService;

