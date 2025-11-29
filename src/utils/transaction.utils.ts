/**
 * Transaction utility functions
 * Helpers for transaction handling and display
 */

import type { Hash, TransactionReceipt } from 'viem';

export type TransactionStatus = 
  | 'idle'
  | 'pending'
  | 'confirming'
  | 'confirmed'
  | 'failed'
  | 'cancelled';

export interface TransactionInfo {
  hash: Hash;
  status: TransactionStatus;
  from: string;
  to?: string;
  value: bigint;
  gasUsed?: bigint;
  gasPrice?: bigint;
  blockNumber?: number;
  timestamp?: number;
  error?: string;
}

/**
 * Format transaction hash for display
 */
export function formatTxHash(hash: string, chars: number = 8): string {
  if (!hash || hash.length < chars * 2) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

/**
 * Calculate transaction fee from receipt
 */
export function calculateTxFee(receipt: TransactionReceipt): bigint {
  return receipt.gasUsed * receipt.effectiveGasPrice;
}

/**
 * Format transaction fee in ETH
 */
export function formatTxFee(fee: bigint, decimals: number = 6): string {
  const eth = Number(fee) / 1e18;
  return eth.toFixed(decimals);
}

/**
 * Estimate transaction time based on gas price
 */
export function estimateTxTime(
  gasPrice: bigint,
  baseFee: bigint,
  priorityFee: bigint
): { seconds: number; label: string } {
  const totalFee = gasPrice + priorityFee;
  const ratio = Number(totalFee) / Number(baseFee);

  if (ratio >= 2) {
    return { seconds: 12, label: 'Fast' };
  }
  if (ratio >= 1.5) {
    return { seconds: 30, label: 'Standard' };
  }
  if (ratio >= 1.1) {
    return { seconds: 60, label: 'Slow' };
  }
  return { seconds: 180, label: 'Very Slow' };
}

/**
 * Check if transaction is pending
 */
export function isPending(status: TransactionStatus): boolean {
  return status === 'pending' || status === 'confirming';
}

/**
 * Check if transaction is final
 */
export function isFinal(status: TransactionStatus): boolean {
  return status === 'confirmed' || status === 'failed' || status === 'cancelled';
}

/**
 * Parse transaction error message
 */
export function parseTransactionError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('user rejected') || message.includes('user denied')) {
      return 'Transaction was rejected by user';
    }
    if (message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    if (message.includes('gas required exceeds') || message.includes('out of gas')) {
      return 'Transaction ran out of gas';
    }
    if (message.includes('nonce too low')) {
      return 'Transaction nonce is too low (pending transaction exists)';
    }
    if (message.includes('replacement transaction underpriced')) {
      return 'Gas price too low to replace pending transaction';
    }
    if (message.includes('execution reverted')) {
      const reasonMatch = error.message.match(/reason="([^"]+)"/);
      if (reasonMatch) {
        return `Transaction reverted: ${reasonMatch[1]}`;
      }
      return 'Transaction was reverted by the contract';
    }
    if (message.includes('timeout')) {
      return 'Transaction confirmation timed out';
    }

    return error.message;
  }

  return 'An unknown error occurred';
}

/**
 * Get status label for UI
 */
export function getStatusLabel(status: TransactionStatus): string {
  const labels: Record<TransactionStatus, string> = {
    idle: 'Ready',
    pending: 'Pending...',
    confirming: 'Confirming...',
    confirmed: 'Confirmed',
    failed: 'Failed',
    cancelled: 'Cancelled',
  };
  return labels[status];
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: TransactionStatus): string {
  const colors: Record<TransactionStatus, string> = {
    idle: 'gray',
    pending: 'yellow',
    confirming: 'blue',
    confirmed: 'green',
    failed: 'red',
    cancelled: 'gray',
  };
  return colors[status];
}

/**
 * Calculate confirmations
 */
export function calculateConfirmations(
  txBlockNumber: number,
  currentBlockNumber: number
): number {
  if (txBlockNumber > currentBlockNumber) return 0;
  return currentBlockNumber - txBlockNumber + 1;
}

/**
 * Check if transaction is confirmed (based on confirmations)
 */
export function isConfirmed(
  txBlockNumber: number,
  currentBlockNumber: number,
  requiredConfirmations: number = 1
): boolean {
  return calculateConfirmations(txBlockNumber, currentBlockNumber) >= requiredConfirmations;
}

/**
 * Create transaction info object
 */
export function createTransactionInfo(
  hash: Hash,
  from: string,
  value: bigint = 0n,
  to?: string
): TransactionInfo {
  return {
    hash,
    status: 'pending',
    from,
    to,
    value,
  };
}

/**
 * Update transaction info from receipt
 */
export function updateFromReceipt(
  info: TransactionInfo,
  receipt: TransactionReceipt
): TransactionInfo {
  return {
    ...info,
    status: receipt.status === 'success' ? 'confirmed' : 'failed',
    gasUsed: receipt.gasUsed,
    gasPrice: receipt.effectiveGasPrice,
    blockNumber: Number(receipt.blockNumber),
  };
}

/**
 * Validate transaction hash format
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Group transactions by status
 */
export function groupByStatus(
  transactions: TransactionInfo[]
): Record<TransactionStatus, TransactionInfo[]> {
  const grouped: Record<TransactionStatus, TransactionInfo[]> = {
    idle: [],
    pending: [],
    confirming: [],
    confirmed: [],
    failed: [],
    cancelled: [],
  };

  for (const tx of transactions) {
    grouped[tx.status].push(tx);
  }

  return grouped;
}

/**
 * Sort transactions by timestamp (most recent first)
 */
export function sortByTimestamp(transactions: TransactionInfo[]): TransactionInfo[] {
  return [...transactions].sort((a, b) => 
    (b.timestamp || 0) - (a.timestamp || 0)
  );
}

