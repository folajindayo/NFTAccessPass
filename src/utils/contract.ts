import { createPublicClient, createWalletClient, http, getContract } from 'viem';
import { hardhat } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

/**
 * ABI for the NFTAccessPass contract.
 * Contains only necessary functions: mintNFT and balanceOf.
 */
export const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "recipient", "type": "address"}],
    "name": "mintNFT",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const privateKey = process.env.PRIVATE_KEY as `0x${string}`;

/**
 * Public Viem client for reading from the blockchain.
 */
export const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(process.env.RPC_URL)
});

/**
 * Wallet Viem client for signing transactions on the server side.
 * Uses the private key from environment variables.
 */
export const walletClient = createWalletClient({
  chain: hardhat,
  transport: http(process.env.RPC_URL),
  account: privateKeyToAccount(privateKey)
});

/**
 * Gets the contract instance with both public and wallet clients.
 * Allows both reading state and writing transactions.
 * @returns The Viem contract instance.
 */
export const getContractInstance = () => {
  return getContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    client: { public: publicClient, wallet: walletClient }
  });
};
