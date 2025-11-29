/**
 * Smart contract-related type definitions
 */

import type { Abi, Address, Hash, Hex } from 'viem';

/**
 * Contract ABI function type
 */
export type ABIFunction = {
  type: 'function';
  name: string;
  inputs: ABIParameter[];
  outputs: ABIParameter[];
  stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
};

/**
 * Contract ABI event type
 */
export type ABIEvent = {
  type: 'event';
  name: string;
  inputs: ABIEventParameter[];
  anonymous?: boolean;
};

/**
 * Contract ABI error type
 */
export type ABIError = {
  type: 'error';
  name: string;
  inputs: ABIParameter[];
};

/**
 * ABI parameter
 */
export interface ABIParameter {
  name: string;
  type: string;
  internalType?: string;
  components?: ABIParameter[];
}

/**
 * ABI event parameter
 */
export interface ABIEventParameter extends ABIParameter {
  indexed?: boolean;
}

/**
 * Contract info
 */
export interface ContractInfo {
  address: Address;
  abi: Abi;
  name?: string;
  chainId: number;
  deployedAt?: number;
  deploymentTxHash?: Hash;
  verified?: boolean;
  sourceCode?: string;
}

/**
 * Contract deployment config
 */
export interface ContractDeployConfig {
  bytecode: Hex;
  abi: Abi;
  constructorArgs?: unknown[];
  salt?: Hex;
}

/**
 * Contract deployment result
 */
export interface ContractDeployResult {
  address: Address;
  transactionHash: Hash;
  blockNumber: number;
  deployer: Address;
  gasUsed: bigint;
}

/**
 * Contract read params
 */
export interface ContractReadParams {
  address: Address;
  abi: Abi;
  functionName: string;
  args?: unknown[];
  account?: Address;
  blockNumber?: bigint;
  blockTag?: 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized';
}

/**
 * Contract write params
 */
export interface ContractWriteParams extends ContractReadParams {
  value?: bigint;
  gas?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce?: number;
}

/**
 * Contract event filter
 */
export interface ContractEventFilter {
  address: Address;
  event: string;
  args?: unknown[];
  fromBlock?: bigint;
  toBlock?: bigint;
}

/**
 * Contract event log
 */
export interface ContractEventLog<T = unknown> {
  eventName: string;
  args: T;
  address: Address;
  blockNumber: bigint;
  transactionHash: Hash;
  transactionIndex: number;
  blockHash: Hash;
  logIndex: number;
  removed: boolean;
}

/**
 * ERC721 contract interface
 */
export interface ERC721Contract {
  name(): Promise<string>;
  symbol(): Promise<string>;
  tokenURI(tokenId: bigint): Promise<string>;
  balanceOf(owner: Address): Promise<bigint>;
  ownerOf(tokenId: bigint): Promise<Address>;
  approve(to: Address, tokenId: bigint): Promise<Hash>;
  getApproved(tokenId: bigint): Promise<Address>;
  setApprovalForAll(operator: Address, approved: boolean): Promise<Hash>;
  isApprovedForAll(owner: Address, operator: Address): Promise<boolean>;
  transferFrom(from: Address, to: Address, tokenId: bigint): Promise<Hash>;
  safeTransferFrom(from: Address, to: Address, tokenId: bigint, data?: Hex): Promise<Hash>;
}

/**
 * ERC1155 contract interface
 */
export interface ERC1155Contract {
  uri(tokenId: bigint): Promise<string>;
  balanceOf(account: Address, tokenId: bigint): Promise<bigint>;
  balanceOfBatch(accounts: Address[], tokenIds: bigint[]): Promise<bigint[]>;
  setApprovalForAll(operator: Address, approved: boolean): Promise<Hash>;
  isApprovedForAll(account: Address, operator: Address): Promise<boolean>;
  safeTransferFrom(from: Address, to: Address, id: bigint, amount: bigint, data?: Hex): Promise<Hash>;
  safeBatchTransferFrom(from: Address, to: Address, ids: bigint[], amounts: bigint[], data?: Hex): Promise<Hash>;
}

/**
 * ERC20 contract interface
 */
export interface ERC20Contract {
  name(): Promise<string>;
  symbol(): Promise<string>;
  decimals(): Promise<number>;
  totalSupply(): Promise<bigint>;
  balanceOf(account: Address): Promise<bigint>;
  allowance(owner: Address, spender: Address): Promise<bigint>;
  approve(spender: Address, amount: bigint): Promise<Hash>;
  transfer(to: Address, amount: bigint): Promise<Hash>;
  transferFrom(from: Address, to: Address, amount: bigint): Promise<Hash>;
}

/**
 * Contract verification status
 */
export interface ContractVerificationStatus {
  isVerified: boolean;
  verifiedAt?: number;
  compiler?: string;
  compilerVersion?: string;
  optimization?: boolean;
  optimizationRuns?: number;
  evmVersion?: string;
  license?: string;
}

/**
 * Contract method call
 */
export interface ContractMethodCall {
  contractAddress: Address;
  methodName: string;
  args: unknown[];
  value?: bigint;
  timestamp: number;
  caller?: Address;
}

/**
 * Multicall request
 */
export interface MulticallRequest {
  address: Address;
  abi: Abi;
  functionName: string;
  args?: unknown[];
}

/**
 * Multicall result
 */
export interface MulticallResult<T = unknown> {
  success: boolean;
  result?: T;
  error?: string;
}

/**
 * Contract upgrade info
 */
export interface ContractUpgradeInfo {
  proxy: Address;
  implementation: Address;
  admin?: Address;
  previousImplementation?: Address;
  upgradedAt?: number;
}

