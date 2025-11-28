import type { NextApiRequest, NextApiResponse } from 'next';
import { getContractInstance } from '@/services/contract.service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { address } = req.query;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ message: 'Valid address is required' });
  }

  try {
    const contract = getContractInstance();
    
    const balance = await contract.read.balanceOf([address as `0x${string}`]);
    
    res.status(200).json({ hasAccess: balance > 0n, balance: balance.toString() });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

