/**
 * Indexer Service for blockchain event indexing
 * Tracks contract events and maintains indexed state
 */

export interface IndexedEvent {
  id: string;
  contractAddress: string;
  eventName: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
  timestamp: number;
  args: Record<string, unknown>;
}

export interface IndexerState {
  lastBlockNumber: number;
  lastSyncTime: number;
  eventCount: number;
  isRunning: boolean;
}

export interface EventFilter {
  contractAddress?: string;
  eventName?: string;
  fromBlock?: number;
  toBlock?: number;
  args?: Record<string, unknown>;
}

export interface IndexerConfig {
  chainId: number;
  rpcUrl: string;
  batchSize: number;
  pollInterval: number;
  maxRetries: number;
  startBlock?: number;
}

type EventCallback = (event: IndexedEvent) => void;

const DEFAULT_CONFIG: Partial<IndexerConfig> = {
  batchSize: 1000,
  pollInterval: 12000, // 12 seconds (avg block time)
  maxRetries: 3,
};

class IndexerService {
  private config: IndexerConfig;
  private events: Map<string, IndexedEvent> = new Map();
  private state: IndexerState;
  private subscribers: Map<string, Set<EventCallback>> = new Map();
  private pollTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(config: IndexerConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config } as IndexerConfig;
    this.state = {
      lastBlockNumber: config.startBlock || 0,
      lastSyncTime: 0,
      eventCount: 0,
      isRunning: false,
    };
  }

  private generateEventId(event: Omit<IndexedEvent, 'id'>): string {
    return `${event.transactionHash}-${event.logIndex}`;
  }

  /**
   * Start the indexer
   */
  async start(): Promise<void> {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    await this.sync();

    this.pollTimer = setInterval(() => {
      this.sync();
    }, this.config.pollInterval);
  }

  /**
   * Stop the indexer
   */
  stop(): void {
    this.state.isRunning = false;
    
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /**
   * Sync events from blockchain
   */
  async sync(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const latestBlock = await this.getLatestBlockNumber();
      
      if (latestBlock <= this.state.lastBlockNumber) {
        return;
      }

      let fromBlock = this.state.lastBlockNumber + 1;
      const toBlock = latestBlock;

      // Process in batches
      while (fromBlock <= toBlock) {
        const batchEnd = Math.min(fromBlock + this.config.batchSize - 1, toBlock);
        
        const events = await this.fetchEvents(fromBlock, batchEnd);
        
        for (const event of events) {
          this.addEvent(event);
        }

        fromBlock = batchEnd + 1;
      }

      this.state.lastBlockNumber = latestBlock;
      this.state.lastSyncTime = Date.now();
    } catch (error) {
      console.error('[Indexer] Sync error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async getLatestBlockNumber(): Promise<number> {
    const response = await fetch(this.config.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
    });

    const data = await response.json();
    return parseInt(data.result, 16);
  }

  private async fetchEvents(
    fromBlock: number,
    toBlock: number
  ): Promise<Array<Omit<IndexedEvent, 'id'>>> {
    // This would typically use eth_getLogs
    // Simplified implementation
    const response = await fetch(`/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chainId: this.config.chainId,
        fromBlock,
        toBlock,
      }),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.events || [];
  }

  private addEvent(event: Omit<IndexedEvent, 'id'>): void {
    const id = this.generateEventId(event);
    
    if (this.events.has(id)) {
      return; // Already indexed
    }

    const indexedEvent: IndexedEvent = { ...event, id };
    this.events.set(id, indexedEvent);
    this.state.eventCount++;

    // Notify subscribers
    this.notifySubscribers(indexedEvent);
  }

  private notifySubscribers(event: IndexedEvent): void {
    // Notify event-specific subscribers
    const eventKey = `${event.contractAddress}:${event.eventName}`;
    const subscribers = this.subscribers.get(eventKey);
    
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('[Indexer] Subscriber error:', error);
        }
      });
    }

    // Notify wildcard subscribers
    const wildcardSubscribers = this.subscribers.get('*');
    if (wildcardSubscribers) {
      wildcardSubscribers.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('[Indexer] Subscriber error:', error);
        }
      });
    }
  }

  /**
   * Subscribe to events
   */
  subscribe(
    contractAddress: string,
    eventName: string,
    callback: EventCallback
  ): () => void {
    const key = `${contractAddress}:${eventName}`;
    
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }

    this.subscribers.get(key)!.add(callback);

    return () => {
      this.subscribers.get(key)?.delete(callback);
    };
  }

  /**
   * Subscribe to all events
   */
  subscribeAll(callback: EventCallback): () => void {
    if (!this.subscribers.has('*')) {
      this.subscribers.set('*', new Set());
    }

    this.subscribers.get('*')!.add(callback);

    return () => {
      this.subscribers.get('*')?.delete(callback);
    };
  }

  /**
   * Query indexed events
   */
  query(filter: EventFilter): IndexedEvent[] {
    let results = Array.from(this.events.values());

    if (filter.contractAddress) {
      results = results.filter(e => 
        e.contractAddress.toLowerCase() === filter.contractAddress!.toLowerCase()
      );
    }

    if (filter.eventName) {
      results = results.filter(e => e.eventName === filter.eventName);
    }

    if (filter.fromBlock !== undefined) {
      results = results.filter(e => e.blockNumber >= filter.fromBlock!);
    }

    if (filter.toBlock !== undefined) {
      results = results.filter(e => e.blockNumber <= filter.toBlock!);
    }

    if (filter.args) {
      results = results.filter(e => {
        for (const [key, value] of Object.entries(filter.args!)) {
          if (e.args[key] !== value) return false;
        }
        return true;
      });
    }

    return results.sort((a, b) => b.blockNumber - a.blockNumber);
  }

  /**
   * Get indexer state
   */
  getState(): IndexerState {
    return { ...this.state };
  }

  /**
   * Clear indexed events
   */
  clear(): void {
    this.events.clear();
    this.state.eventCount = 0;
  }

  /**
   * Destroy the indexer
   */
  destroy(): void {
    this.stop();
    this.clear();
    this.subscribers.clear();
  }
}

// Factory function
export function createIndexer(config: IndexerConfig): IndexerService {
  return new IndexerService(config);
}

export { IndexerService };

export default IndexerService;

