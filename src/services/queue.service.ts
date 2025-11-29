/**
 * Queue Service for transaction queue management
 * Handles sequential transaction execution with retry logic
 */

export type TransactionStatus = 
  | 'queued'
  | 'processing'
  | 'pending'
  | 'confirmed'
  | 'failed'
  | 'cancelled';

export interface QueuedTransaction {
  id: string;
  type: string;
  status: TransactionStatus;
  data: Record<string, unknown>;
  hash?: string;
  error?: string;
  retries: number;
  maxRetries: number;
  createdAt: number;
  updatedAt: number;
  priority: number;
}

export interface TransactionExecutor {
  execute: (data: Record<string, unknown>) => Promise<string>;
  validate?: (data: Record<string, unknown>) => boolean;
}

export interface QueueConfig {
  maxConcurrent: number;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

type QueueSubscriber = (transactions: QueuedTransaction[]) => void;
type TransactionCallback = (tx: QueuedTransaction) => void;

const DEFAULT_CONFIG: QueueConfig = {
  maxConcurrent: 1,
  maxRetries: 3,
  retryDelay: 5000,
  timeout: 120000, // 2 minutes
};

class QueueService {
  private config: QueueConfig;
  private queue: Map<string, QueuedTransaction> = new Map();
  private executors: Map<string, TransactionExecutor> = new Map();
  private subscribers: Set<QueueSubscriber> = new Set();
  private txCallbacks: Map<string, TransactionCallback[]> = new Map();
  private processingCount = 0;
  private isProcessing = false;

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private generateId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notify(): void {
    const transactions = Array.from(this.queue.values())
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.createdAt - b.createdAt;
      });

    this.subscribers.forEach(callback => callback(transactions));
  }

  private notifyTransaction(tx: QueuedTransaction): void {
    const callbacks = this.txCallbacks.get(tx.id);
    if (callbacks) {
      callbacks.forEach(cb => cb(tx));
    }
  }

  /**
   * Register a transaction executor
   */
  registerExecutor(type: string, executor: TransactionExecutor): void {
    this.executors.set(type, executor);
  }

  /**
   * Subscribe to queue updates
   */
  subscribe(callback: QueueSubscriber): () => void {
    this.subscribers.add(callback);
    callback(Array.from(this.queue.values()));

    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Add transaction to queue
   */
  enqueue(
    type: string,
    data: Record<string, unknown>,
    options: { priority?: number; onUpdate?: TransactionCallback } = {}
  ): string {
    const executor = this.executors.get(type);
    if (!executor) {
      throw new Error(`No executor registered for type: ${type}`);
    }

    if (executor.validate && !executor.validate(data)) {
      throw new Error('Transaction validation failed');
    }

    const id = this.generateId();
    const transaction: QueuedTransaction = {
      id,
      type,
      status: 'queued',
      data,
      retries: 0,
      maxRetries: this.config.maxRetries,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      priority: options.priority || 0,
    };

    this.queue.set(id, transaction);

    if (options.onUpdate) {
      this.txCallbacks.set(id, [options.onUpdate]);
    }

    this.notify();
    this.processQueue();

    return id;
  }

  /**
   * Cancel a queued transaction
   */
  cancel(id: string): boolean {
    const tx = this.queue.get(id);
    if (!tx || tx.status !== 'queued') {
      return false;
    }

    tx.status = 'cancelled';
    tx.updatedAt = Date.now();

    this.notifyTransaction(tx);
    this.notify();

    return true;
  }

  /**
   * Retry a failed transaction
   */
  retry(id: string): boolean {
    const tx = this.queue.get(id);
    if (!tx || tx.status !== 'failed') {
      return false;
    }

    tx.status = 'queued';
    tx.retries = 0;
    tx.error = undefined;
    tx.updatedAt = Date.now();

    this.notifyTransaction(tx);
    this.notify();
    this.processQueue();

    return true;
  }

  /**
   * Get transaction by ID
   */
  get(id: string): QueuedTransaction | null {
    return this.queue.get(id) || null;
  }

  /**
   * Get all transactions
   */
  getAll(): QueuedTransaction[] {
    return Array.from(this.queue.values());
  }

  /**
   * Get pending transactions
   */
  getPending(): QueuedTransaction[] {
    return this.getAll().filter(tx => 
      tx.status === 'queued' || 
      tx.status === 'processing' || 
      tx.status === 'pending'
    );
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.processingCount < this.config.maxConcurrent) {
        const nextTx = this.getNextTransaction();
        if (!nextTx) break;

        this.processingCount++;
        this.processTransaction(nextTx).finally(() => {
          this.processingCount--;
          this.processQueue();
        });
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private getNextTransaction(): QueuedTransaction | null {
    const queued = Array.from(this.queue.values())
      .filter(tx => tx.status === 'queued')
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.createdAt - b.createdAt;
      });

    return queued[0] || null;
  }

  private async processTransaction(tx: QueuedTransaction): Promise<void> {
    const executor = this.executors.get(tx.type);
    if (!executor) {
      tx.status = 'failed';
      tx.error = 'Executor not found';
      tx.updatedAt = Date.now();
      this.notifyTransaction(tx);
      this.notify();
      return;
    }

    tx.status = 'processing';
    tx.updatedAt = Date.now();
    this.notifyTransaction(tx);
    this.notify();

    try {
      const hash = await Promise.race([
        executor.execute(tx.data),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Transaction timeout')), this.config.timeout)
        ),
      ]);

      tx.hash = hash;
      tx.status = 'pending';
      tx.updatedAt = Date.now();
      this.notifyTransaction(tx);
      this.notify();

      // Wait for confirmation (simplified)
      await this.waitForConfirmation(hash);

      tx.status = 'confirmed';
      tx.updatedAt = Date.now();
    } catch (error) {
      tx.retries++;
      
      if (tx.retries < tx.maxRetries) {
        tx.status = 'queued';
        tx.updatedAt = Date.now();
        
        // Delay before retry
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
      } else {
        tx.status = 'failed';
        tx.error = error instanceof Error ? error.message : 'Unknown error';
        tx.updatedAt = Date.now();
      }
    }

    this.notifyTransaction(tx);
    this.notify();
  }

  private async waitForConfirmation(hash: string): Promise<void> {
    // Simplified confirmation wait
    const maxAttempts = 30;
    const interval = 4000;

    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(`/api/transaction/receipt?hash=${hash}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.receipt) {
          return;
        }
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error('Confirmation timeout');
  }

  /**
   * Clear completed transactions
   */
  clearCompleted(): void {
    for (const [id, tx] of this.queue.entries()) {
      if (tx.status === 'confirmed' || tx.status === 'failed' || tx.status === 'cancelled') {
        this.queue.delete(id);
        this.txCallbacks.delete(id);
      }
    }
    this.notify();
  }

  /**
   * Clear all transactions
   */
  clearAll(): void {
    this.queue.clear();
    this.txCallbacks.clear();
    this.notify();
  }
}

// Export singleton instance
export const queueService = new QueueService();

// Export class for custom instances
export { QueueService };

export default queueService;

