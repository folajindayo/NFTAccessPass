import { useState, useCallback, useMemo } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { getContract, type Address } from 'viem';
import { CONTRACT_ABI } from '@/services/contract.service';

interface UseContractReturn {
  address: Address | undefined;
  isConnected: boolean;
  isReady: boolean;
  readContract: <T>(functionName: string, args?: unknown[]) => Promise<T | null>;
  writeContract: (functionName: string, args?: unknown[]) => Promise<`0x${string}` | null>;
  error: Error | null;
}

/**
 * Hook for interacting with the NFT Access Pass contract
 */
export function useContract(): UseContractReturn {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [error, setError] = useState<Error | null>(null);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address | undefined;

  const isReady = useMemo(() => {
    return isConnected && !!walletClient && !!contractAddress;
  }, [isConnected, walletClient, contractAddress]);

  const contract = useMemo(() => {
    if (!contractAddress || !publicClient) return null;
    
    return getContract({
      address: contractAddress,
      abi: CONTRACT_ABI,
      client: publicClient,
    });
  }, [contractAddress, publicClient]);

  const readContract = useCallback(async <T>(
    functionName: string,
    args: unknown[] = []
  ): Promise<T | null> => {
    setError(null);
    
    if (!contract || !publicClient) {
      setError(new Error('Contract not initialized'));
      return null;
    }

    try {
      const result = await publicClient.readContract({
        address: contractAddress!,
        abi: CONTRACT_ABI,
        functionName,
        args,
      });
      return result as T;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Read failed');
      setError(error);
      return null;
    }
  }, [contract, publicClient, contractAddress]);

  const writeContract = useCallback(async (
    functionName: string,
    args: unknown[] = []
  ): Promise<`0x${string}` | null> => {
    setError(null);
    
    if (!walletClient || !contractAddress || !address) {
      setError(new Error('Wallet not connected'));
      return null;
    }

    try {
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName,
        args,
        account: address,
      });
      return hash;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Write failed');
      setError(error);
      return null;
    }
  }, [walletClient, contractAddress, address]);

  return {
    address,
    isConnected,
    isReady,
    readContract,
    writeContract,
    error,
  };
}

/**
 * Hook to check if an address has an NFT
 */
export function useHasNFT(targetAddress?: Address) {
  const { readContract, address: connectedAddress } = useContract();
  const [hasNFT, setHasNFT] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkAddress = targetAddress || connectedAddress;

  const checkBalance = useCallback(async () => {
    if (!checkAddress) return;
    
    setIsLoading(true);
    const balance = await readContract<bigint>('balanceOf', [checkAddress]);
    setHasNFT(balance !== null && balance > 0n);
    setIsLoading(false);
  }, [checkAddress, readContract]);

  return { hasNFT, isLoading, checkBalance };
}

export default useContract;

