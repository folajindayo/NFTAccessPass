import type { NextApiRequest, NextApiResponse } from 'next';
import { isAddress } from 'viem';

import { 
  getContractInstance, 
  publicClient,
  withRetry,
} from '@/services/contract.service';
import type { MintResponse } from '@/types';

/**
 * Validate request body
 */
function validateRequest(body: unknown): { valid: boolean; error?: string; address?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { address } = body as { address?: string };

  if (!address) {
    return { valid: false, error: 'Address is required' };
  }

  if (!isAddress(address)) {
    return { valid: false, error: 'Invalid Ethereum address' };
  }

  return { valid: true, address };
}

/**
 * Mint NFT to address
 */
async function mintNFT(address: string): Promise<{ hash: string }> {
  const contract = getContractInstance();
  
  // Use retry wrapper for resilience
  const hash = await withRetry(async () => {
    return contract.write.mintNFT([address as `0x${string}`]);
  }, {
    maxAttempts: 3,
    baseDelay: 1000,
  });

  // Wait for confirmation with retry
  await withRetry(async () => {
    return publicClient.waitForTransactionReceipt({ 
      hash,
      confirmations: 1,
    });
  }, {
    maxAttempts: 10,
    baseDelay: 2000,
    maxDelay: 10000,
  });

  return { hash };
}

/**
 * Error response helper
 */
function errorResponse(
  res: NextApiResponse<MintResponse>,
  status: number,
  message: string
): void {
  res.status(status).json({
    success: false,
    error: message,
  });
}

/**
 * Parse error message
 */
function parseErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('insufficient funds')) {
      return 'Minting wallet has insufficient funds';
    }
    if (message.includes('max supply')) {
      return 'Maximum NFT supply reached';
    }
    if (message.includes('already minted')) {
      return 'Address already has an NFT';
    }
    if (message.includes('paused')) {
      return 'Minting is currently paused';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Mint API handler
 * POST /api/mint
 * Body: { address: string }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MintResponse>
) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return errorResponse(res, 405, 'Method not allowed');
  }

  // Validate request
  const validation = validateRequest(req.body);
  if (!validation.valid || !validation.address) {
    return errorResponse(res, 400, validation.error || 'Invalid request');
  }

  try {
    // Mint NFT
    const { hash } = await mintNFT(validation.address);

    // Success response
    res.status(200).json({
      success: true,
      txHash: hash,
    });
  } catch (error) {
    console.error('[Mint API] Error:', error);
    
    const message = parseErrorMessage(error);
    return errorResponse(res, 500, message);
  }
}
