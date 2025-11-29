/**
 * Event-related type definitions
 */

import type { Address, Hash, Hex } from 'viem';

/**
 * Base blockchain event
 */
export interface BlockchainEvent {
  eventName: string;
  address: Address;
  blockNumber: bigint;
  blockHash: Hash;
  transactionHash: Hash;
  transactionIndex: number;
  logIndex: number;
  removed: boolean;
  timestamp?: number;
}

/**
 * Transfer event (ERC20)
 */
export interface TransferEvent extends BlockchainEvent {
  eventName: 'Transfer';
  args: {
    from: Address;
    to: Address;
    value: bigint;
  };
}

/**
 * Approval event (ERC20)
 */
export interface ApprovalEvent extends BlockchainEvent {
  eventName: 'Approval';
  args: {
    owner: Address;
    spender: Address;
    value: bigint;
  };
}

/**
 * Transfer event (ERC721)
 */
export interface ERC721TransferEvent extends BlockchainEvent {
  eventName: 'Transfer';
  args: {
    from: Address;
    to: Address;
    tokenId: bigint;
  };
}

/**
 * Approval event (ERC721)
 */
export interface ERC721ApprovalEvent extends BlockchainEvent {
  eventName: 'Approval';
  args: {
    owner: Address;
    approved: Address;
    tokenId: bigint;
  };
}

/**
 * ApprovalForAll event
 */
export interface ApprovalForAllEvent extends BlockchainEvent {
  eventName: 'ApprovalForAll';
  args: {
    owner: Address;
    operator: Address;
    approved: boolean;
  };
}

/**
 * TransferSingle event (ERC1155)
 */
export interface TransferSingleEvent extends BlockchainEvent {
  eventName: 'TransferSingle';
  args: {
    operator: Address;
    from: Address;
    to: Address;
    id: bigint;
    value: bigint;
  };
}

/**
 * TransferBatch event (ERC1155)
 */
export interface TransferBatchEvent extends BlockchainEvent {
  eventName: 'TransferBatch';
  args: {
    operator: Address;
    from: Address;
    to: Address;
    ids: bigint[];
    values: bigint[];
  };
}

/**
 * Mint event (custom)
 */
export interface MintEvent extends BlockchainEvent {
  eventName: 'Mint' | 'Transfer';
  args: {
    to: Address;
    tokenId: bigint;
    mintPrice?: bigint;
  };
}

/**
 * Event subscription
 */
export interface EventSubscription {
  id: string;
  address: Address;
  eventName: string;
  filter?: Record<string, unknown>;
  callback: (event: BlockchainEvent) => void;
  active: boolean;
}

/**
 * Event filter
 */
export interface EventFilter {
  address?: Address | Address[];
  topics?: Array<Hash | Hash[] | null>;
  fromBlock?: bigint | 'latest' | 'earliest' | 'pending';
  toBlock?: bigint | 'latest' | 'earliest' | 'pending';
}

/**
 * Event log
 */
export interface EventLog {
  address: Address;
  blockHash: Hash;
  blockNumber: bigint;
  data: Hex;
  logIndex: number;
  removed: boolean;
  topics: Hash[];
  transactionHash: Hash;
  transactionIndex: number;
}

/**
 * Decoded event
 */
export interface DecodedEvent<T = unknown> {
  eventName: string;
  args: T;
  raw: EventLog;
}

/**
 * Event history options
 */
export interface EventHistoryOptions {
  address: Address;
  eventName?: string;
  fromBlock?: bigint;
  toBlock?: bigint;
  limit?: number;
  offset?: number;
}

/**
 * Event history result
 */
export interface EventHistoryResult<T extends BlockchainEvent = BlockchainEvent> {
  events: T[];
  total: number;
  fromBlock: bigint;
  toBlock: bigint;
  hasMore: boolean;
}

/**
 * Event listener
 */
export type EventListener<T = unknown> = (event: DecodedEvent<T>) => void;

/**
 * Event unsubscribe function
 */
export type EventUnsubscribe = () => void;

/**
 * Real-time event
 */
export interface RealtimeEvent {
  id: string;
  type: string;
  data: unknown;
  timestamp: number;
  chainId: number;
}

/**
 * Webhook event payload
 */
export interface WebhookEventPayload {
  id: string;
  type: string;
  network: string;
  webhookId: string;
  event: BlockchainEvent;
  createdAt: string;
}

/**
 * Event aggregation
 */
export interface EventAggregation {
  eventName: string;
  address: Address;
  count: number;
  firstBlock: bigint;
  lastBlock: bigint;
  uniqueAddresses: number;
}

/**
 * Event stream config
 */
export interface EventStreamConfig {
  addresses: Address[];
  events: string[];
  chainId: number;
  fromBlock?: bigint;
  includeRemoved?: boolean;
  pollingInterval?: number;
}

/**
 * Event batch
 */
export interface EventBatch {
  events: BlockchainEvent[];
  fromBlock: bigint;
  toBlock: bigint;
  timestamp: number;
}

