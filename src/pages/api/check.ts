import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers, JsonRpcProvider, Contract } from 'ethers';
import NFTAccessPassArtifact from '../../../artifacts/contracts/NFTAccessPass.sol/NFTAccessPass.json';

const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; 
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { address } = req.query;

  if (!address || typeof address !== 'string' || !ethers.isAddress(address)) {
    return res.status(400).json({ message: 'Invalid wallet address' });
  }

  try {
    const provider = new JsonRpcProvider(RPC_URL);
    // Read-only provider is enough for checking balance
    const contract = new Contract(CONTRACT_ADDRESS, NFTAccessPassArtifact.abi, provider);

    const balance = await contract.balanceOf(address);
    const hasAccess = Number(balance) > 0;

    return res.status(200).json({ hasAccess });
  } catch (error: any) {
    console.error("Check error:", error);
    return res.status(500).json({ message: 'Check failed', error: error.message });
  }
}

