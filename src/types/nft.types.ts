/**
 * NFT-related type definitions
 */

import type { Address, Hash } from 'viem';

/**
 * NFT token standards
 */
export type NFTStandard = 'ERC721' | 'ERC1155';

/**
 * NFT metadata attribute
 */
export interface NFTAttribute {
  trait_type: string;
  value: string | number | boolean;
  display_type?: 'number' | 'boost_number' | 'boost_percentage' | 'date' | 'string';
  max_value?: number;
}

/**
 * NFT metadata (OpenSea standard)
 */
export interface NFTMetadata {
  name: string;
  description?: string;
  image?: string;
  image_data?: string;
  external_url?: string;
  animation_url?: string;
  background_color?: string;
  attributes?: NFTAttribute[];
  properties?: Record<string, unknown>;
  // Additional fields
  created_by?: string;
  token_id?: string;
  contract_address?: string;
}

/**
 * NFT token
 */
export interface NFTToken {
  contractAddress: Address;
  tokenId: string;
  tokenStandard: NFTStandard;
  owner: Address;
  balance: bigint;
  metadata?: NFTMetadata;
  tokenUri?: string;
  lastTransferTimestamp?: number;
}

/**
 * NFT collection
 */
export interface NFTCollection {
  address: Address;
  name: string;
  symbol: string;
  tokenStandard: NFTStandard;
  totalSupply?: bigint;
  owner?: Address;
  contractUri?: string;
  imageUrl?: string;
  bannerUrl?: string;
  description?: string;
  externalUrl?: string;
  verified?: boolean;
  floorPrice?: {
    value: bigint;
    currency: string;
  };
}

/**
 * NFT transfer event
 */
export interface NFTTransfer {
  transactionHash: Hash;
  blockNumber: number;
  timestamp: number;
  from: Address;
  to: Address;
  tokenId: string;
  contractAddress: Address;
  value?: bigint; // For ERC1155
  logIndex: number;
}

/**
 * NFT mint event
 */
export interface NFTMint {
  transactionHash: Hash;
  blockNumber: number;
  timestamp: number;
  to: Address;
  tokenId: string;
  contractAddress: Address;
  value?: bigint;
  mintPrice?: bigint;
}

/**
 * NFT ownership check result
 */
export interface NFTOwnershipResult {
  isOwner: boolean;
  balance: bigint;
  tokenIds: string[];
  contractAddress: Address;
  checkedAt: number;
}

/**
 * NFT approval
 */
export interface NFTApproval {
  contractAddress: Address;
  owner: Address;
  approved: Address;
  tokenId?: string;
  isApprovedForAll: boolean;
}

/**
 * Access pass NFT specific
 */
export interface AccessPassNFT extends NFTToken {
  tier?: AccessTier;
  expiresAt?: number;
  isValid: boolean;
  features: string[];
}

/**
 * Access tier
 */
export type AccessTier = 'basic' | 'standard' | 'premium' | 'vip';

/**
 * Access tier config
 */
export interface AccessTierConfig {
  tier: AccessTier;
  name: string;
  description: string;
  color: string;
  features: string[];
  price?: bigint;
  maxSupply?: number;
}

/**
 * Token gating rule
 */
export interface TokenGatingRule {
  id: string;
  contractAddress: Address;
  tokenStandard: NFTStandard;
  minBalance: bigint;
  tokenIds?: string[];
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  requireAll: boolean;
}

/**
 * Token gating result
 */
export interface TokenGatingResult {
  hasAccess: boolean;
  rules: Array<{
    rule: TokenGatingRule;
    passed: boolean;
    balance: bigint;
  }>;
  checkedAt: number;
}

/**
 * NFT listing
 */
export interface NFTListing {
  contractAddress: Address;
  tokenId: string;
  seller: Address;
  price: bigint;
  currency: Address;
  startTime: number;
  endTime?: number;
  marketplace: string;
}

/**
 * NFT royalty info
 */
export interface NFTRoyaltyInfo {
  receiver: Address;
  royaltyAmount: bigint;
  feeDenominator: bigint;
  percentBps: number;
}

/**
 * NFT filter options
 */
export interface NFTFilterOptions {
  contractAddresses?: Address[];
  tokenIds?: string[];
  ownerAddress?: Address;
  tokenStandard?: NFTStandard;
  includeMetadata?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'tokenId' | 'transferTime' | 'name';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated NFT result
 */
export interface PaginatedNFTResult {
  items: NFTToken[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

