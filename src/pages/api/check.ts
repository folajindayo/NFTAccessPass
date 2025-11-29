import type { NextApiRequest, NextApiResponse } from 'next';
import { isAddress } from 'viem';

import { getContractInstance, withRetry } from '@/services/contract.service';
import { cacheService, createCacheKey } from '@/services/cache.service';
import type { AccessCheckResponse } from '@/types';

/**
 * Cache TTL for access checks (30 seconds)
 */
const CACHE_TTL = 30 * 1000;

/**
 * Validate query parameters
 */
function validateQuery(query: NextApiRequest['query']): { 
  valid: boolean; 
  error?: string; 
  address?: string;
} {
  const { address } = query;

  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Address query parameter is required' };
  }

  if (!isAddress(address)) {
    return { valid: false, error: 'Invalid Ethereum address format' };
  }

  return { valid: true, address };
}

/**
 * Check NFT balance for address
 */
async function checkBalance(address: string): Promise<{ hasAccess: boolean; balance: bigint }> {
  const cacheKey = createCacheKey('access', address.toLowerCase());
  
  // Check cache first
  const cached = cacheService.get<{ hasAccess: boolean; balance: string }>(cacheKey);
  if (cached) {
    return {
      hasAccess: cached.hasAccess,
      balance: BigInt(cached.balance),
    };
  }

  // Fetch from contract with retry
  const contract = getContractInstance();
  
  const balance = await withRetry(async () => {
    return contract.read.balanceOf([address as `0x${string}`]);
  }, {
    maxAttempts: 3,
    baseDelay: 500,
  });

  const result = {
    hasAccess: balance > 0n,
    balance,
  };

  // Cache the result
  cacheService.set(cacheKey, {
    hasAccess: result.hasAccess,
    balance: result.balance.toString(),
  }, CACHE_TTL);

  return result;
}

/**
 * Error response helper
 */
function errorResponse(
  res: NextApiResponse<AccessCheckResponse>,
  status: number,
  message: string
): void {
  res.status(status).json({
    hasAccess: false,
    balance: '0',
    error: message,
  });
}

/**
 * Access check API handler
 * GET /api/check?address=0x...
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AccessCheckResponse>
) {
  // Only allow GET
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return errorResponse(res, 405, 'Method not allowed');
  }

  // Validate query
  const validation = validateQuery(req.query);
  if (!validation.valid || !validation.address) {
    return errorResponse(res, 400, validation.error || 'Invalid request');
  }

  try {
    // Check access
    const { hasAccess, balance } = await checkBalance(validation.address);

    // Set cache headers
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

    // Success response
    res.status(200).json({
      hasAccess,
      balance: balance.toString(),
      address: validation.address,
      checkedAt: Date.now(),
    });
  } catch (error) {
    console.error('[Check API] Error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to check access';
    return errorResponse(res, 500, message);
  }
}
