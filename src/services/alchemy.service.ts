/**
 * Alchemy Service for NFT data retrieval
 * Provides indexed NFT data, ownership info, and metadata
 */

export interface AlchemyConfig {
  apiKey: string;
  network: string;
  baseUrl?: string;
}

export interface NFTMetadata {
  tokenId: string;
  name: string;
  description?: string;
  image?: {
    cachedUrl: string;
    originalUrl: string;
    contentType: string;
  };
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface OwnedNFT {
  contract: {
    address: string;
    name: string;
    symbol: string;
    tokenType: 'ERC721' | 'ERC1155';
  };
  tokenId: string;
  balance: string;
  title: string;
  description: string;
  tokenUri: string;
  media: Array<{
    gateway: string;
    raw: string;
  }>;
  metadata: NFTMetadata;
  timeLastUpdated: string;
}

export interface NFTCollection {
  contract: string;
  name: string;
  symbol: string;
  totalSupply: string;
  tokenType: 'ERC721' | 'ERC1155';
  openSea?: {
    floorPrice: number;
    collectionName: string;
    imageUrl: string;
  };
}

export interface TransferEvent {
  blockNumber: number;
  transactionHash: string;
  from: string;
  to: string;
  tokenId: string;
  timestamp: string;
}

const NETWORK_URLS: Record<string, string> = {
  'eth-mainnet': 'https://eth-mainnet.g.alchemy.com/nft/v3',
  'eth-sepolia': 'https://eth-sepolia.g.alchemy.com/nft/v3',
  'polygon-mainnet': 'https://polygon-mainnet.g.alchemy.com/nft/v3',
  'arbitrum-mainnet': 'https://arb-mainnet.g.alchemy.com/nft/v3',
  'optimism-mainnet': 'https://opt-mainnet.g.alchemy.com/nft/v3',
  'base-mainnet': 'https://base-mainnet.g.alchemy.com/nft/v3',
};

class AlchemyService {
  private config: AlchemyConfig;
  private baseUrl: string;

  constructor(config: AlchemyConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || NETWORK_URLS[config.network] || NETWORK_URLS['eth-mainnet'];
  }

  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}/${this.config.apiKey}/${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Alchemy API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get NFTs owned by an address
   */
  async getNFTsForOwner(
    ownerAddress: string,
    options: {
      contractAddresses?: string[];
      pageKey?: string;
      pageSize?: number;
      excludeFilters?: string[];
    } = {}
  ): Promise<{
    ownedNfts: OwnedNFT[];
    pageKey?: string;
    totalCount: number;
  }> {
    const params: Record<string, string> = {
      owner: ownerAddress,
      withMetadata: 'true',
    };

    if (options.contractAddresses?.length) {
      params['contractAddresses[]'] = options.contractAddresses.join(',');
    }
    if (options.pageKey) {
      params.pageKey = options.pageKey;
    }
    if (options.pageSize) {
      params.pageSize = options.pageSize.toString();
    }

    return this.request('getNFTsForOwner', params);
  }

  /**
   * Check if address owns NFTs from a contract
   */
  async checkOwnership(
    ownerAddress: string,
    contractAddress: string
  ): Promise<{ isOwner: boolean; balance: number; tokenIds: string[] }> {
    const result = await this.getNFTsForOwner(ownerAddress, {
      contractAddresses: [contractAddress],
    });

    return {
      isOwner: result.ownedNfts.length > 0,
      balance: result.ownedNfts.length,
      tokenIds: result.ownedNfts.map(nft => nft.tokenId),
    };
  }

  /**
   * Get NFT metadata by token ID
   */
  async getNFTMetadata(
    contractAddress: string,
    tokenId: string,
    options: { refreshCache?: boolean } = {}
  ): Promise<NFTMetadata> {
    const params: Record<string, string> = {
      contractAddress,
      tokenId,
    };

    if (options.refreshCache) {
      params.refreshCache = 'true';
    }

    return this.request('getNFTMetadata', params);
  }

  /**
   * Get collection/contract metadata
   */
  async getContractMetadata(contractAddress: string): Promise<NFTCollection> {
    return this.request('getContractMetadata', { contractAddress });
  }

  /**
   * Get owners of a specific NFT
   */
  async getOwnersForNFT(
    contractAddress: string,
    tokenId: string
  ): Promise<{ owners: string[] }> {
    return this.request('getOwnersForNFT', { contractAddress, tokenId });
  }

  /**
   * Get all owners for a collection
   */
  async getOwnersForContract(
    contractAddress: string,
    options: { pageKey?: string } = {}
  ): Promise<{ owners: string[]; pageKey?: string }> {
    const params: Record<string, string> = { contractAddress };
    if (options.pageKey) {
      params.pageKey = options.pageKey;
    }

    return this.request('getOwnersForContract', params);
  }

  /**
   * Get NFT transfers for a contract
   */
  async getTransfers(
    contractAddress: string,
    options: {
      fromBlock?: string;
      toBlock?: string;
      pageKey?: string;
    } = {}
  ): Promise<{ transfers: TransferEvent[]; pageKey?: string }> {
    const params: Record<string, string> = { contractAddress };
    if (options.fromBlock) params.fromBlock = options.fromBlock;
    if (options.toBlock) params.toBlock = options.toBlock;
    if (options.pageKey) params.pageKey = options.pageKey;

    return this.request('getAssetTransfers', params);
  }

  /**
   * Verify floor price for a collection
   */
  async getFloorPrice(contractAddress: string): Promise<{
    openSea?: { floorPrice: number; priceCurrency: string };
    looksRare?: { floorPrice: number; priceCurrency: string };
  }> {
    return this.request('getFloorPrice', { contractAddress });
  }

  /**
   * Refresh metadata for an NFT
   */
  async refreshMetadata(contractAddress: string, tokenId: string): Promise<boolean> {
    try {
      await this.getNFTMetadata(contractAddress, tokenId, { refreshCache: true });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get spam contracts
   */
  async isSpamContract(contractAddress: string): Promise<boolean> {
    try {
      const result = await this.request<{ isSpam: boolean }>('isSpamContract', {
        contractAddress,
      });
      return result.isSpam;
    } catch {
      return false;
    }
  }

  /**
   * Change network
   */
  setNetwork(network: string): void {
    this.config.network = network;
    this.baseUrl = NETWORK_URLS[network] || NETWORK_URLS['eth-mainnet'];
  }
}

// Factory function to create service instance
export function createAlchemyService(config: AlchemyConfig): AlchemyService {
  return new AlchemyService(config);
}

export { AlchemyService };

export default AlchemyService;

