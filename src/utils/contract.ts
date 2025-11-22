import { createPublicClient, createWalletClient, http, getContract } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { hardhat } from 'viem/chains';

// ABI for the NFTAccessPass contract
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

export const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(process.env.RPC_URL)
});

export const walletClient = createWalletClient({
  chain: hardhat,
  transport: http(process.env.RPC_URL),
  account: privateKeyToAccount(privateKey)
});

export const getContractInstance = () => {
  return getContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    client: { public: publicClient, wallet: walletClient }
  });
};

