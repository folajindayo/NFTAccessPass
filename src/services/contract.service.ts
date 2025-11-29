/**
 * Contract Service
 * 
 * Provides contract interaction utilities including client creation,
 * contract instances, and transaction handling with retry logic.
 */

import { 
  createPublicClient, 
  createWalletClient, 
  http, 
  getContract,
  type PublicClient,
  type WalletClient,
  type Chain,
  type Address,
  type Abi,
  type Hash,
} from 'viem';
import { hardhat, mainnet, sepolia, base, arbitrum, optimism, polygon } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

/**
 * Custom error types for better error handling
 */
export class ContractError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'ContractError';
  }
}

export class TransactionError extends ContractError {
  constructor(
    message: string,
    public readonly hash?: Hash,
    originalError?: Error
  ) {
    super(message, 'TRANSACTION_FAILED', originalError);
    this.name = 'TransactionError';
  }
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(config.backoffFactor, attempt);
  return Math.min(delay, config.maxDelay);
}

/**
 * Generic retry wrapper with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retryConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on user rejection or validation errors
      const errorMessage = lastError.message.toLowerCase();
      if (
        errorMessage.includes('user rejected') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('insufficient funds')
      ) {
        throw lastError;
      }

      if (attempt < retryConfig.maxAttempts - 1) {
        const delay = calculateDelay(attempt, retryConfig);
        await sleep(delay);
      }
    }
  }

  throw new ContractError(
    `Operation failed after ${retryConfig.maxAttempts} attempts: ${lastError?.message}`,
    'MAX_RETRIES_EXCEEDED',
    lastError || undefined
  );
}

/**
 * ABI for the NFTAccessPass contract
 * Contains essential functions: mintNFT, balanceOf, ownerOf
 */
export const NFT_ACCESS_PASS_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'recipient', type: 'address' }],
    name: 'mintNFT',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Supported chain configurations
 */
export const SUPPORTED_CHAINS: Record<string, Chain> = {
  hardhat,
  mainnet,
  sepolia,
  base,
  arbitrum,
  optimism,
  polygon,
};

/**
 * Chain ID to chain mapping
 */
export const CHAIN_BY_ID: Record<number, Chain> = {
  1: mainnet,
  11155111: sepolia,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
  31337: hardhat,
};

/**
 * Get chain configuration by name or ID
 */
export function getChainConfig(chainNameOrId: string | number): Chain {
  if (typeof chainNameOrId === 'number') {
    const chain = Object.values(SUPPORTED_CHAINS).find(c => c.id === chainNameOrId);
    if (!chain) throw new Error(`Unsupported chain ID: ${chainNameOrId}`);
    return chain;
  }
  
  const chain = SUPPORTED_CHAINS[chainNameOrId];
  if (!chain) throw new Error(`Unsupported chain: ${chainNameOrId}`);
  return chain;
}

/**
 * Contract addresses per chain
 */
export function getContractAddress(): Address {
  const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!address) {
    throw new Error('Contract address not configured');
  }
  return address as Address;
}

/**
 * Get RPC URL for current environment
 */
export function getRpcUrl(): string {
  return process.env.RPC_URL || 'http://127.0.0.1:8545';
}

/**
 * Create a public client for reading from the blockchain
 */
export function createPublicClientInstance(chain: Chain = hardhat): PublicClient {
  return createPublicClient({
    chain,
    transport: http(getRpcUrl()),
  });
}

/**
 * Create a wallet client for signing transactions (server-side only)
 */
export function createWalletClientInstance(chain: Chain = hardhat): WalletClient {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('Private key not configured');
  }
  
  return createWalletClient({
    chain,
    transport: http(getRpcUrl()),
    account: privateKeyToAccount(privateKey as `0x${string}`),
  });
}

/**
 * Get NFT Access Pass contract instance
 */
export function getNFTContract(publicClient: PublicClient, walletClient?: WalletClient) {
  const address = getContractAddress();
  
  return getContract({
    address,
    abi: NFT_ACCESS_PASS_ABI,
    client: walletClient 
      ? { public: publicClient, wallet: walletClient }
      : publicClient,
  });
}

/**
 * Generic contract factory for any contract
 */
export function createContractInstance<TAbi extends Abi>(
  address: Address,
  abi: TAbi,
  publicClient: PublicClient,
  walletClient?: WalletClient
) {
  return getContract({
    address,
    abi,
    client: walletClient 
      ? { public: publicClient, wallet: walletClient }
      : publicClient,
  });
}

/**
 * Read contract with retry
 */
export async function readContractWithRetry<T>(
  publicClient: PublicClient,
  address: Address,
  abi: Abi,
  functionName: string,
  args: unknown[] = [],
  retryConfig?: Partial<RetryConfig>
): Promise<T> {
  return withRetry(async () => {
    const result = await publicClient.readContract({
      address,
      abi,
      functionName,
      args,
    });
    return result as T;
  }, retryConfig);
}

/**
 * Write contract with retry and wait for receipt
 */
export async function writeContractWithRetry(
  walletClient: WalletClient,
  publicClient: PublicClient,
  address: Address,
  abi: Abi,
  functionName: string,
  args: unknown[] = [],
  retryConfig?: Partial<RetryConfig>
): Promise<{ hash: Hash; receipt: unknown }> {
  const hash = await withRetry(async () => {
    return walletClient.writeContract({
      address,
      abi,
      functionName,
      args,
    });
  }, retryConfig);

  // Wait for receipt with retry
  const receipt = await withRetry(async () => {
    return publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
    });
  }, { ...retryConfig, maxAttempts: 10, baseDelay: 2000 });

  return { hash, receipt };
}

/**
 * Estimate gas with buffer
 */
export async function estimateGasWithBuffer(
  publicClient: PublicClient,
  address: Address,
  abi: Abi,
  functionName: string,
  args: unknown[] = [],
  bufferPercent: number = 20
): Promise<bigint> {
  const estimate = await publicClient.estimateContractGas({
    address,
    abi,
    functionName,
    args,
  });

  return estimate + (estimate * BigInt(bufferPercent)) / 100n;
}

/**
 * Check if address is a contract
 */
export async function isContract(
  publicClient: PublicClient,
  address: Address
): Promise<boolean> {
  try {
    const code = await publicClient.getCode({ address });
    return code !== undefined && code !== '0x';
  } catch {
    return false;
  }
}

// Legacy exports for backward compatibility
export const CONTRACT_ABI = NFT_ACCESS_PASS_ABI;
export const publicClient = createPublicClientInstance();
export const walletClient = createWalletClientInstance();
export const getContractInstance = () => getNFTContract(publicClient, walletClient);

