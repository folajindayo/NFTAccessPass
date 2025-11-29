/**
 * NFT-specific utility functions
 * Helpers for NFT operations, metadata, and validation
 */

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'number' | 'boost_number' | 'boost_percentage' | 'date';
}

export interface NFTMetadata {
  name: string;
  description?: string;
  image?: string;
  external_url?: string;
  animation_url?: string;
  background_color?: string;
  attributes?: NFTAttribute[];
  properties?: Record<string, unknown>;
}

/**
 * Parse token ID from various formats
 */
export function parseTokenId(tokenId: string | number | bigint): bigint {
  if (typeof tokenId === 'bigint') {
    return tokenId;
  }
  if (typeof tokenId === 'number') {
    return BigInt(tokenId);
  }
  if (tokenId.startsWith('0x')) {
    return BigInt(tokenId);
  }
  return BigInt(tokenId);
}

/**
 * Format token ID for display
 */
export function formatTokenId(tokenId: bigint | string | number, maxLength: number = 8): string {
  const id = parseTokenId(tokenId).toString();
  if (id.length <= maxLength) {
    return `#${id}`;
  }
  return `#${id.slice(0, 4)}...${id.slice(-4)}`;
}

/**
 * Validate NFT metadata structure
 */
export function validateMetadata(metadata: unknown): metadata is NFTMetadata {
  if (!metadata || typeof metadata !== 'object') {
    return false;
  }

  const m = metadata as Record<string, unknown>;
  
  // Name is required
  if (typeof m.name !== 'string' || m.name.trim() === '') {
    return false;
  }

  // Optional fields validation
  if (m.description !== undefined && typeof m.description !== 'string') {
    return false;
  }

  if (m.image !== undefined && typeof m.image !== 'string') {
    return false;
  }

  if (m.attributes !== undefined && !Array.isArray(m.attributes)) {
    return false;
  }

  return true;
}

/**
 * Normalize image URL (handle IPFS, data URIs, etc.)
 */
export function normalizeImageUrl(url: string, gateway: string = 'https://ipfs.io/ipfs/'): string {
  if (!url) return '';

  // Handle IPFS URLs
  if (url.startsWith('ipfs://')) {
    return `${gateway}${url.slice(7)}`;
  }

  // Handle Arweave URLs
  if (url.startsWith('ar://')) {
    return `https://arweave.net/${url.slice(5)}`;
  }

  // Keep data URIs as-is
  if (url.startsWith('data:')) {
    return url;
  }

  // Keep HTTP(S) URLs as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Assume bare IPFS hash
  return `${gateway}${url}`;
}

/**
 * Extract IPFS CID from URL
 */
export function extractIpfsCid(url: string): string | null {
  // IPFS protocol
  const ipfsMatch = url.match(/^ipfs:\/\/(.+)/);
  if (ipfsMatch) {
    return ipfsMatch[1].split('/')[0];
  }

  // IPFS gateway URLs
  const gatewayMatch = url.match(/\/ipfs\/([a-zA-Z0-9]+)/);
  if (gatewayMatch) {
    return gatewayMatch[1];
  }

  return null;
}

/**
 * Get attribute value by trait type
 */
export function getAttributeValue(
  attributes: NFTAttribute[] | undefined,
  traitType: string
): string | number | undefined {
  if (!attributes) return undefined;
  const attr = attributes.find(
    a => a.trait_type.toLowerCase() === traitType.toLowerCase()
  );
  return attr?.value;
}

/**
 * Check if NFT has specific trait
 */
export function hasTrait(
  attributes: NFTAttribute[] | undefined,
  traitType: string,
  value?: string | number
): boolean {
  if (!attributes) return false;
  
  if (value === undefined) {
    return attributes.some(
      a => a.trait_type.toLowerCase() === traitType.toLowerCase()
    );
  }

  return attributes.some(
    a => a.trait_type.toLowerCase() === traitType.toLowerCase() &&
         String(a.value).toLowerCase() === String(value).toLowerCase()
  );
}

/**
 * Sort attributes by trait type
 */
export function sortAttributes(attributes: NFTAttribute[]): NFTAttribute[] {
  return [...attributes].sort((a, b) => 
    a.trait_type.localeCompare(b.trait_type)
  );
}

/**
 * Calculate rarity score based on trait frequency
 */
export function calculateRarityScore(
  attributes: NFTAttribute[],
  traitFrequencies: Map<string, Map<string | number, number>>,
  totalSupply: number
): number {
  let score = 0;

  for (const attr of attributes) {
    const traitMap = traitFrequencies.get(attr.trait_type);
    if (traitMap) {
      const frequency = traitMap.get(attr.value) || 1;
      const rarity = 1 / (frequency / totalSupply);
      score += rarity;
    }
  }

  return score;
}

/**
 * Generate placeholder metadata
 */
export function generatePlaceholderMetadata(tokenId: string | number): NFTMetadata {
  return {
    name: `Token #${tokenId}`,
    description: 'Metadata loading...',
    image: '',
    attributes: [],
  };
}

/**
 * Check if metadata is placeholder
 */
export function isPlaceholderMetadata(metadata: NFTMetadata): boolean {
  return metadata.description === 'Metadata loading...' && metadata.image === '';
}

/**
 * Merge metadata objects
 */
export function mergeMetadata(base: NFTMetadata, override: Partial<NFTMetadata>): NFTMetadata {
  return {
    ...base,
    ...override,
    attributes: override.attributes || base.attributes,
    properties: {
      ...base.properties,
      ...override.properties,
    },
  };
}

/**
 * Generate ERC721 token URI
 */
export function generateTokenUri(baseUri: string, tokenId: string | number): string {
  const base = baseUri.endsWith('/') ? baseUri : `${baseUri}/`;
  return `${base}${tokenId}`;
}

/**
 * Check if address owns token (helper)
 */
export function isOwner(owner: string, address: string): boolean {
  return owner.toLowerCase() === address.toLowerCase();
}

