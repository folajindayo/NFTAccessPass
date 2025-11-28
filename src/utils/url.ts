/**
 * URL manipulation utilities
 */

/**
 * Parses query parameters from a URL string
 */
export function parseQueryParams(url: string): Record<string, string> {
  try {
    const urlObj = new URL(url, window.location.origin);
    const params: Record<string, string> = {};
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  } catch {
    return {};
  }
}

/**
 * Builds a query string from an object
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Appends query parameters to a URL
 */
export function appendQueryParams(
  url: string,
  params: Record<string, string | number | boolean | undefined>
): string {
  try {
    const urlObj = new URL(url, window.location.origin);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObj.searchParams.append(key, String(value));
      }
    });
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Removes query parameters from a URL
 */
export function removeQueryParams(url: string, keys: string[]): string {
  try {
    const urlObj = new URL(url, window.location.origin);
    keys.forEach(key => urlObj.searchParams.delete(key));
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Gets a specific query parameter from a URL
 */
export function getQueryParam(url: string, key: string): string | null {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.searchParams.get(key);
  } catch {
    return null;
  }
}

/**
 * Checks if a URL is absolute
 */
export function isAbsoluteUrl(url: string): boolean {
  return /^(https?:)?\/\//i.test(url);
}

/**
 * Checks if a URL is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the base URL (protocol + host)
 */
export function getBaseUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch {
    return '';
  }
}

/**
 * Gets the pathname from a URL
 */
export function getPathname(url: string): string {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.pathname;
  } catch {
    return '';
  }
}

/**
 * Joins URL path segments
 */
export function joinPaths(...segments: string[]): string {
  return segments
    .map((segment, index) => {
      if (index === 0) {
        return segment.replace(/\/$/, '');
      }
      return segment.replace(/^\//, '').replace(/\/$/, '');
    })
    .filter(Boolean)
    .join('/');
}

/**
 * Creates an explorer URL for a transaction
 */
export function getExplorerTxUrl(txHash: string, chainId = 1): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    5: 'https://goerli.etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    137: 'https://polygonscan.com',
    31337: '', // localhost
  };
  
  const baseUrl = explorers[chainId] || explorers[1];
  if (!baseUrl) return '';
  return `${baseUrl}/tx/${txHash}`;
}

/**
 * Creates an explorer URL for an address
 */
export function getExplorerAddressUrl(address: string, chainId = 1): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    5: 'https://goerli.etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    137: 'https://polygonscan.com',
    31337: '', // localhost
  };
  
  const baseUrl = explorers[chainId] || explorers[1];
  if (!baseUrl) return '';
  return `${baseUrl}/address/${address}`;
}

/**
 * Creates an explorer URL for a token
 */
export function getExplorerTokenUrl(address: string, chainId = 1): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    5: 'https://goerli.etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    137: 'https://polygonscan.com',
    31337: '', // localhost
  };
  
  const baseUrl = explorers[chainId] || explorers[1];
  if (!baseUrl) return '';
  return `${baseUrl}/token/${address}`;
}

/**
 * Creates an IPFS gateway URL
 */
export function ipfsToHttp(ipfsUrl: string, gateway = 'https://ipfs.io'): string {
  if (!ipfsUrl) return '';
  
  if (ipfsUrl.startsWith('ipfs://')) {
    const cid = ipfsUrl.replace('ipfs://', '');
    return `${gateway}/ipfs/${cid}`;
  }
  
  if (ipfsUrl.startsWith('Qm') || ipfsUrl.startsWith('bafy')) {
    return `${gateway}/ipfs/${ipfsUrl}`;
  }
  
  return ipfsUrl;
}

/**
 * Extracts the domain from a URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

/**
 * Checks if a URL matches a pattern (supports wildcards)
 */
export function matchesPattern(url: string, pattern: string): boolean {
  const regexPattern = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\*/g, '.*');
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(url);
}

/**
 * Normalizes a URL (removes trailing slashes, lowercase)
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.toString().toLowerCase().replace(/\/+$/, '');
  } catch {
    return url.toLowerCase().replace(/\/+$/, '');
  }
}

export default {
  parseQueryParams,
  buildQueryString,
  appendQueryParams,
  removeQueryParams,
  getQueryParam,
  isAbsoluteUrl,
  isValidUrl,
  getBaseUrl,
  getPathname,
  joinPaths,
  getExplorerTxUrl,
  getExplorerAddressUrl,
  getExplorerTokenUrl,
  ipfsToHttp,
  extractDomain,
  matchesPattern,
  normalizeUrl,
};

