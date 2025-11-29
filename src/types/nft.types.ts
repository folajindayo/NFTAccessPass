/**
 * NFT Types
 * Type definitions for NFT operations
 */

import { type Address, type Hex } from 'viem';

/**
 * NFT standard
 */
export type NFTStandard = 'ERC721' | 'ERC1155';

/**
 * NFT token
 */
export interface NFTToken {
  tokenId: bigint;
  contractAddress: Address;
  standard: NFTStandard;
  owner: Address;
  balance?: bigint; // For ERC1155
  metadata?: NFTMetadata;
  tokenURI?: string;
  createdAt?: Date;
  lastTransferAt?: Date;
}

/**
 * NFT metadata
 */
export interface NFTMetadata {
  name: string;
  description?: string;
  image?: string;
  animationUrl?: string;
  externalUrl?: string;
  backgroundColor?: string;
  attributes?: NFTAttribute[];
  properties?: Record<string, unknown>;
}

/**
 * NFT attribute
 */
export interface NFTAttribute {
  traitType: string;
  value: string | number;
  displayType?: 'number' | 'boost_number' | 'boost_percentage' | 'date';
  maxValue?: number;
}

/**
 * NFT collection
 */
export interface NFTCollection {
  address: Address;
  name: string;
  symbol: string;
  standard: NFTStandard;
  totalSupply?: bigint;
  maxSupply?: bigint;
  owner?: Address;
  baseURI?: string;
  contractURI?: string;
  royaltyInfo?: RoyaltyInfo;
  floorPrice?: bigint;
  volume?: bigint;
}

/**
 * Royalty info
 */
export interface RoyaltyInfo {
  receiver: Address;
  feeNumerator: number;
  feeDenominator: number;
}

/**
 * NFT transfer
 */
export interface NFTTransfer {
  id: string;
  tokenId: bigint;
  contractAddress: Address;
  from: Address;
  to: Address;
  amount?: bigint; // For ERC1155
  transactionHash: Hex;
  blockNumber: bigint;
  timestamp: Date;
}

/**
 * NFT approval
 */
export interface NFTApproval {
  contractAddress: Address;
  tokenId?: bigint;
  owner: Address;
  approved: Address;
  isApprovedForAll: boolean;
  transactionHash: Hex;
  blockNumber: bigint;
}

/**
 * Mint parameters
 */
export interface MintParams {
  recipient: Address;
  tokenId?: bigint;
  amount?: bigint;
  tokenURI?: string;
  data?: Hex;
}

/**
 * Mint result
 */
export interface MintResult {
  success: boolean;
  tokenId: bigint;
  transactionHash: Hex;
  blockNumber: bigint;
  gasUsed: bigint;
  error?: string;
}

/**
 * Burn parameters
 */
export interface BurnParams {
  tokenId: bigint;
  amount?: bigint; // For ERC1155
}

/**
 * NFT listing (marketplace)
 */
export interface NFTListing {
  id: string;
  tokenId: bigint;
  contractAddress: Address;
  seller: Address;
  price: bigint;
  currency: Address;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
}

/**
 * NFT offer (marketplace)
 */
export interface NFTOffer {
  id: string;
  tokenId: bigint;
  contractAddress: Address;
  buyer: Address;
  amount: bigint;
  currency: Address;
  expiresAt: Date;
  status: 'active' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
}

/**
 * Access tier
 */
export interface AccessTier {
  id: string;
  name: string;
  requiredTokens: number;
  benefits: string[];
  color: string;
  icon?: string;
}

/**
 * Access check result
 */
export interface AccessCheckResult {
  hasAccess: boolean;
  tier?: AccessTier;
  tokenCount: number;
  tokens: NFTToken[];
  missingTokens?: number;
}

/**
 * Token gate config
 */
export interface TokenGateConfig {
  contractAddress: Address;
  standard: NFTStandard;
  minTokens: number;
  requiredTokenIds?: bigint[];
  requiredAttributes?: RequiredAttribute[];
  tiers: AccessTier[];
}

/**
 * Required attribute
 */
export interface RequiredAttribute {
  traitType: string;
  values: (string | number)[];
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte';
}

/**
 * NFT activity
 */
export interface NFTActivity {
  id: string;
  type: NFTActivityType;
  tokenId: bigint;
  contractAddress: Address;
  from?: Address;
  to?: Address;
  price?: bigint;
  currency?: Address;
  transactionHash: Hex;
  blockNumber: bigint;
  timestamp: Date;
}

/**
 * NFT activity type
 */
export type NFTActivityType =
  | 'mint'
  | 'transfer'
  | 'burn'
  | 'sale'
  | 'list'
  | 'delist'
  | 'offer'
  | 'offer_accepted'
  | 'approval';

/**
 * NFT filter
 */
export interface NFTFilter {
  contractAddress?: Address;
  owner?: Address;
  tokenIds?: bigint[];
  attributes?: { traitType: string; values: string[] }[];
  minPrice?: bigint;
  maxPrice?: bigint;
  isListed?: boolean;
}

/**
 * NFT sort
 */
export interface NFTSort {
  field: 'tokenId' | 'price' | 'lastTransfer' | 'rarity';
  order: 'asc' | 'desc';
}

/**
 * NFT statistics
 */
export interface NFTStatistics {
  totalSupply: number;
  totalOwners: number;
  floorPrice: bigint;
  volume24h: bigint;
  volumeTotal: bigint;
  averagePrice: bigint;
  listedCount: number;
  salesCount: number;
}
