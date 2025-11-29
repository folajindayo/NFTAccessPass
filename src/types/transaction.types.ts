/**
 * Transaction-related type definitions
 */

import type { Address, Hash, Hex } from 'viem';

/**
 * Transaction status
 */
export type TransactionStatus = 
  | 'idle'
  | 'preparing'
  | 'pending'
  | 'confirming'
  | 'confirmed'
  | 'failed'
  | 'reverted'
  | 'cancelled';

/**
 * Transaction type
 */
export type TransactionType = 
  | 'transfer'
  | 'mint'
  | 'approve'
  | 'swap'
  | 'stake'
  | 'unstake'
  | 'claim'
  | 'contract_interaction'
  | 'deploy'
  | 'unknown';

/**
 * Base transaction request
 */
export interface TransactionRequest {
  to: Address;
  from?: Address;
  value?: bigint;
  data?: Hex;
  nonce?: number;
  gas?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  chainId?: number;
}

/**
 * Transaction with hash
 */
export interface Transaction extends TransactionRequest {
  hash: Hash;
  blockNumber?: number;
  blockHash?: Hash;
  timestamp?: number;
  status: TransactionStatus;
  confirmations?: number;
}

/**
 * Transaction receipt
 */
export interface TransactionReceipt {
  transactionHash: Hash;
  transactionIndex: number;
  blockHash: Hash;
  blockNumber: number;
  from: Address;
  to: Address | null;
  contractAddress: Address | null;
  cumulativeGasUsed: bigint;
  gasUsed: bigint;
  effectiveGasPrice: bigint;
  status: 'success' | 'reverted';
  logs: TransactionLog[];
  logsBloom: Hex;
}

/**
 * Transaction log
 */
export interface TransactionLog {
  address: Address;
  topics: Hash[];
  data: Hex;
  blockNumber: number;
  transactionHash: Hash;
  transactionIndex: number;
  blockHash: Hash;
  logIndex: number;
  removed: boolean;
}

/**
 * Transaction history item
 */
export interface TransactionHistoryItem {
  hash: Hash;
  type: TransactionType;
  status: TransactionStatus;
  from: Address;
  to: Address;
  value: bigint;
  timestamp: number;
  chainId: number;
  blockNumber?: number;
  gasUsed?: bigint;
  gasFee?: bigint;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Gas estimate
 */
export interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  estimatedCost: bigint;
  estimatedCostUsd?: number;
}

/**
 * Gas price levels
 */
export interface GasPriceLevels {
  slow: GasPrice;
  standard: GasPrice;
  fast: GasPrice;
  instant: GasPrice;
  baseFee: bigint;
  lastUpdated: number;
}

/**
 * Gas price
 */
export interface GasPrice {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  estimatedTime: number;
  label: string;
}

/**
 * Transaction simulation result
 */
export interface SimulationResult {
  success: boolean;
  gasUsed: bigint;
  returnData?: Hex;
  revertReason?: string;
  stateChanges?: StateChange[];
  logs?: TransactionLog[];
}

/**
 * State change from simulation
 */
export interface StateChange {
  address: Address;
  slot: Hex;
  before: Hex;
  after: Hex;
}

/**
 * Transaction batch
 */
export interface TransactionBatch {
  id: string;
  transactions: TransactionRequest[];
  status: TransactionStatus;
  hashes?: Hash[];
  createdAt: number;
  executedAt?: number;
}

/**
 * Speed up transaction params
 */
export interface SpeedUpParams {
  hash: Hash;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
}

/**
 * Cancel transaction params
 */
export interface CancelParams {
  hash: Hash;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
}

/**
 * Transaction filter
 */
export interface TransactionFilter {
  address?: Address;
  fromBlock?: number;
  toBlock?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  chainId?: number;
  limit?: number;
  offset?: number;
}

/**
 * Transaction notification
 */
export interface TransactionNotification {
  hash: Hash;
  type: 'submitted' | 'confirmed' | 'failed' | 'cancelled';
  title: string;
  message: string;
  timestamp: number;
  chainId: number;
}

/**
 * Transaction callback
 */
export interface TransactionCallbacks {
  onSubmitted?: (hash: Hash) => void;
  onConfirmed?: (receipt: TransactionReceipt) => void;
  onFailed?: (error: Error) => void;
  onCancelled?: () => void;
}

