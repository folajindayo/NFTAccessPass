import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers, JsonRpcProvider, Wallet, Contract } from 'ethers';
import NFTAccessPassArtifact from '../../../artifacts/contracts/NFTAccessPass.sol/NFTAccessPass.json';

const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Replace with actual deployed address or env var
// Local Hardhat Network default private key for Account #0
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; 
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { address } = req.body;

  if (!address || !ethers.isAddress(address)) {
    return res.status(400).json({ message: 'Invalid wallet address' });
  }

  try {
    const provider = new JsonRpcProvider(RPC_URL);
    const wallet = new Wallet(PRIVATE_KEY, provider);
    const contract = new Contract(CONTRACT_ADDRESS, NFTAccessPassArtifact.abi, wallet);

    // Check if user already owns one
    const balance = await contract.balanceOf(address);
    if (Number(balance) > 0) {
      return res.status(400).json({ message: 'User already owns an Access Pass' });
    }

    // Mint NFT
    const tx = await contract.mintNFT(address);
    await tx.wait();

    return res.status(200).json({ success: true, txHash: tx.hash });
  } catch (error: any) {
    console.error("Minting error:", error);
    return res.status(500).json({ message: 'Minting failed', error: error.message });
  }
}

