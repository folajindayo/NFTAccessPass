import type { NextApiRequest, NextApiResponse } from 'next';
import { getContractInstance, publicClient, CONTRACT_ABI } from '@/services/contract.service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ message: 'Address is required' });
  }

  try {
    const contract = getContractInstance();
    
    const hash = await contract.write.mintNFT([address]);
    
    await publicClient.waitForTransactionReceipt({ hash });

    res.status(200).json({ success: true, txHash: hash });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}

