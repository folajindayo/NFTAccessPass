import { useState, useCallback, useEffect } from 'react';

export type ApprovalState = 
  | 'checking'
  | 'not_approved'
  | 'approving'
  | 'approved'
  | 'error';

export interface UseNFTApprovalOptions {
  tokenAddress: string;
  tokenId?: string;
  operatorAddress: string;
  ownerAddress: string | undefined;
  chainId?: number;
  enabled?: boolean;
}

export interface UseNFTApprovalResult {
  state: ApprovalState;
  isApproved: boolean;
  isApprovedForAll: boolean;
  loading: boolean;
  error: Error | null;
  approve: () => Promise<boolean>;
  approveForAll: (approved: boolean) => Promise<boolean>;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage NFT approval flows for marketplace or transfer operations.
 * Supports both single token approval and approval for all.
 */
export function useNFTApproval({
  tokenAddress,
  tokenId,
  operatorAddress,
  ownerAddress,
  chainId = 1,
  enabled = true,
}: UseNFTApprovalOptions): UseNFTApprovalResult {
  const [state, setState] = useState<ApprovalState>('checking');
  const [isApproved, setIsApproved] = useState(false);
  const [isApprovedForAll, setIsApprovedForAll] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkApproval = useCallback(async () => {
    if (!ownerAddress || !tokenAddress || !operatorAddress || !enabled) {
      setState('not_approved');
      return;
    }

    setState('checking');
    setError(null);

    try {
      // Check if approved for all
      const forAllApproved = await checkIsApprovedForAll(
        tokenAddress,
        ownerAddress,
        operatorAddress,
        chainId
      );

      setIsApprovedForAll(forAllApproved);

      if (forAllApproved) {
        setIsApproved(true);
        setState('approved');
        return;
      }

      // Check single token approval if tokenId provided
      if (tokenId) {
        const singleApproved = await checkGetApproved(
          tokenAddress,
          tokenId,
          operatorAddress,
          chainId
        );

        setIsApproved(singleApproved);
        setState(singleApproved ? 'approved' : 'not_approved');
      } else {
        setIsApproved(false);
        setState('not_approved');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check approval'));
      setState('error');
    }
  }, [tokenAddress, tokenId, operatorAddress, ownerAddress, chainId, enabled]);

  useEffect(() => {
    checkApproval();
  }, [checkApproval]);

  const approve = useCallback(async (): Promise<boolean> => {
    if (!ownerAddress || !tokenId) {
      setError(new Error('Owner address and token ID required'));
      return false;
    }

    setState('approving');
    setError(null);

    try {
      await sendApprove(tokenAddress, operatorAddress, tokenId, chainId);
      setIsApproved(true);
      setState('approved');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Approval failed'));
      setState('error');
      return false;
    }
  }, [tokenAddress, tokenId, operatorAddress, ownerAddress, chainId]);

  const approveForAll = useCallback(async (approved: boolean): Promise<boolean> => {
    if (!ownerAddress) {
      setError(new Error('Owner address required'));
      return false;
    }

    setState('approving');
    setError(null);

    try {
      await sendSetApprovalForAll(tokenAddress, operatorAddress, approved, chainId);
      setIsApprovedForAll(approved);
      setIsApproved(approved);
      setState(approved ? 'approved' : 'not_approved');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Approval for all failed'));
      setState('error');
      return false;
    }
  }, [tokenAddress, operatorAddress, ownerAddress, chainId]);

  return {
    state,
    isApproved: isApproved || isApprovedForAll,
    isApprovedForAll,
    loading: state === 'checking' || state === 'approving',
    error,
    approve,
    approveForAll,
    refetch: checkApproval,
  };
}

async function checkIsApprovedForAll(
  tokenAddress: string,
  ownerAddress: string,
  operatorAddress: string,
  chainId: number
): Promise<boolean> {
  const response = await fetch('/api/contract/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: tokenAddress,
      functionName: 'isApprovedForAll',
      args: [ownerAddress, operatorAddress],
      chainId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to check approval for all');
  }

  const data = await response.json();
  return Boolean(data.result);
}

async function checkGetApproved(
  tokenAddress: string,
  tokenId: string,
  operatorAddress: string,
  chainId: number
): Promise<boolean> {
  const response = await fetch('/api/contract/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: tokenAddress,
      functionName: 'getApproved',
      args: [tokenId],
      chainId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to check token approval');
  }

  const data = await response.json();
  return data.result?.toLowerCase() === operatorAddress.toLowerCase();
}

async function sendApprove(
  tokenAddress: string,
  operatorAddress: string,
  tokenId: string,
  chainId: number
): Promise<string> {
  const response = await fetch('/api/contract/write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: tokenAddress,
      functionName: 'approve',
      args: [operatorAddress, tokenId],
      chainId,
    }),
  });

  if (!response.ok) {
    throw new Error('Approval transaction failed');
  }

  const data = await response.json();
  return data.transactionHash;
}

async function sendSetApprovalForAll(
  tokenAddress: string,
  operatorAddress: string,
  approved: boolean,
  chainId: number
): Promise<string> {
  const response = await fetch('/api/contract/write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: tokenAddress,
      functionName: 'setApprovalForAll',
      args: [operatorAddress, approved],
      chainId,
    }),
  });

  if (!response.ok) {
    throw new Error('Set approval for all transaction failed');
  }

  const data = await response.json();
  return data.transactionHash;
}

export default useNFTApproval;

