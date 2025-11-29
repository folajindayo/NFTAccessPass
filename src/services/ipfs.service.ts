/**
 * IPFS Service for metadata storage and retrieval
 * Handles pinning, unpinning, and gateway resolution
 */

export interface IPFSConfig {
  gateway: string;
  pinningEndpoint?: string;
  apiKey?: string;
  timeout?: number;
}

export interface PinResponse {
  ipfsHash: string;
  pinSize: number;
  timestamp: Date;
}

export interface IPFSMetadata {
  name: string;
  description?: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  animation_url?: string;
}

const DEFAULT_CONFIG: IPFSConfig = {
  gateway: 'https://ipfs.io/ipfs/',
  timeout: 30000,
};

class IPFSService {
  private config: IPFSConfig;
  private gatewayCache: Map<string, string> = new Map();

  constructor(config: Partial<IPFSConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Convert IPFS URI to HTTP gateway URL
   */
  resolveUri(uri: string): string {
    // Check cache first
    if (this.gatewayCache.has(uri)) {
      return this.gatewayCache.get(uri)!;
    }

    let resolved: string;

    if (uri.startsWith('ipfs://')) {
      const hash = uri.replace('ipfs://', '');
      resolved = `${this.config.gateway}${hash}`;
    } else if (uri.startsWith('Qm') || uri.startsWith('bafy')) {
      resolved = `${this.config.gateway}${uri}`;
    } else {
      resolved = uri;
    }

    this.gatewayCache.set(uri, resolved);
    return resolved;
  }

  /**
   * Fetch metadata from IPFS
   */
  async fetchMetadata(uri: string): Promise<IPFSMetadata> {
    const resolvedUri = this.resolveUri(uri);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(resolvedUri, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const metadata = await response.json();
      
      // Resolve image URI if it's IPFS
      if (metadata.image) {
        metadata.image = this.resolveUri(metadata.image);
      }
      if (metadata.animation_url) {
        metadata.animation_url = this.resolveUri(metadata.animation_url);
      }

      return metadata;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Pin JSON metadata to IPFS
   */
  async pinJSON(metadata: IPFSMetadata): Promise<PinResponse> {
    if (!this.config.pinningEndpoint || !this.config.apiKey) {
      throw new Error('Pinning not configured');
    }

    const response = await fetch(`${this.config.pinningEndpoint}/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataOptions: {
          cidVersion: 1,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to pin JSON');
    }

    const data = await response.json();

    return {
      ipfsHash: data.IpfsHash,
      pinSize: data.PinSize,
      timestamp: new Date(data.Timestamp),
    };
  }

  /**
   * Pin file to IPFS
   */
  async pinFile(file: File | Blob, filename?: string): Promise<PinResponse> {
    if (!this.config.pinningEndpoint || !this.config.apiKey) {
      throw new Error('Pinning not configured');
    }

    const formData = new FormData();
    formData.append('file', file, filename);

    const response = await fetch(`${this.config.pinningEndpoint}/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to pin file');
    }

    const data = await response.json();

    return {
      ipfsHash: data.IpfsHash,
      pinSize: data.PinSize,
      timestamp: new Date(data.Timestamp),
    };
  }

  /**
   * Unpin content from IPFS
   */
  async unpin(ipfsHash: string): Promise<boolean> {
    if (!this.config.pinningEndpoint || !this.config.apiKey) {
      throw new Error('Pinning not configured');
    }

    const response = await fetch(`${this.config.pinningEndpoint}/unpin/${ipfsHash}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    return response.ok;
  }

  /**
   * Check if content is pinned
   */
  async isPinned(ipfsHash: string): Promise<boolean> {
    if (!this.config.pinningEndpoint || !this.config.apiKey) {
      return false;
    }

    const response = await fetch(
      `${this.config.pinningEndpoint}/pinList?hashContains=${ipfsHash}`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.count > 0;
  }

  /**
   * Upload and pin complete NFT metadata with image
   */
  async uploadNFTMetadata(
    image: File | Blob,
    metadata: Omit<IPFSMetadata, 'image'>
  ): Promise<{ metadataHash: string; imageHash: string }> {
    // First, pin the image
    const imageResult = await this.pinFile(image);
    const imageUri = `ipfs://${imageResult.ipfsHash}`;

    // Then pin the metadata with image reference
    const fullMetadata: IPFSMetadata = {
      ...metadata,
      image: imageUri,
    };

    const metadataResult = await this.pinJSON(fullMetadata);

    return {
      metadataHash: metadataResult.ipfsHash,
      imageHash: imageResult.ipfsHash,
    };
  }

  /**
   * Clear the gateway cache
   */
  clearCache(): void {
    this.gatewayCache.clear();
  }

  /**
   * Update gateway URL
   */
  setGateway(gateway: string): void {
    this.config.gateway = gateway;
    this.clearCache();
  }
}

// Export singleton instance
export const ipfsService = new IPFSService();

// Export class for custom instances
export { IPFSService };

export default ipfsService;

