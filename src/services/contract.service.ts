/**
 * Contract Service
 * 
 * Provides contract interaction utilities including client creation,
 * contract instances, and transaction handling.
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
} from 'viem';
import { hardhat, mainnet, sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

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
] as const;

/**
 * Supported chain configurations
 */
export const SUPPORTED_CHAINS: Record<string, Chain> = {
  hardhat,
  mainnet,
  sepolia,
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

// Legacy exports for backward compatibility
export const CONTRACT_ABI = NFT_ACCESS_PASS_ABI;
export const publicClient = createPublicClientInstance();
export const walletClient = createWalletClientInstance();
export const getContractInstance = () => getNFTContract(publicClient, walletClient);

