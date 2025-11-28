/**
 * NFT Service
 * 
 * Handles NFT-related operations including fetching metadata,
 * verifying ownership, and interacting with NFT contracts.
 */

import { type Address } from 'viem';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface NFTOwnership {
  tokenId: bigint;
  owner: Address;
  contractAddress: Address;
  isValid: boolean;
}

export interface NFTBalance {
  balance: bigint;
  hasAccess: boolean;
}

/**
 * Fetch NFT metadata from a given token URI
 * @param tokenUri - The URI to fetch metadata from
 * @returns Promise resolving to NFT metadata
 */
export async function fetchNFTMetadata(tokenUri: string): Promise<NFTMetadata> {
  // Handle IPFS URIs
  const resolvedUri = tokenUri.startsWith('ipfs://')
    ? tokenUri.replace('ipfs://', 'https://ipfs.io/ipfs/')
    : tokenUri;

  const response = await fetch(resolvedUri);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.statusText}`);
  }

  const metadata = await response.json() as NFTMetadata;
  
  // Resolve IPFS image URLs as well
  if (metadata.image?.startsWith('ipfs://')) {
    metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }

  return metadata;
}

/**
 * Check if a wallet address owns any NFT from a specific collection
 * @param balance - The NFT balance to check
 * @returns Whether the user has access
 */
export function hasNFTAccess(balance: bigint): boolean {
  return balance > 0n;
}

/**
 * Format token ID for display
 * @param tokenId - The token ID as bigint
 * @returns Formatted string representation
 */
export function formatTokenId(tokenId: bigint): string {
  return `#${tokenId.toString()}`;
}

/**
 * Validate an Ethereum address
 * @param address - The address to validate
 * @returns Whether the address is valid
 */
export function isValidAddress(address: string): address is Address {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Generate default metadata for a newly minted NFT
 * @param tokenId - The token ID
 * @param contractName - The contract name
 * @returns Default NFT metadata
 */
export function generateDefaultMetadata(
  tokenId: bigint,
  contractName: string = 'NFT Access Pass'
): NFTMetadata {
  return {
    name: `${contractName} ${formatTokenId(tokenId)}`,
    description: `Access pass granting exclusive content access`,
    image: '/placeholder-nft.png',
    attributes: [
      { trait_type: 'Token ID', value: tokenId.toString() },
      { trait_type: 'Type', value: 'Access Pass' },
    ],
  };
}

/**
 * Calculate rarity score based on attributes
 * @param attributes - The NFT attributes
 * @returns Rarity score from 0-100
 */
export function calculateRarityScore(
  attributes: NFTMetadata['attributes']
): number {
  if (!attributes || attributes.length === 0) {
    return 0;
  }
  
  // Simple rarity calculation based on attribute count
  const baseScore = Math.min(attributes.length * 10, 50);
  const randomFactor = Math.floor(Math.random() * 50);
  
  return Math.min(baseScore + randomFactor, 100);
}

