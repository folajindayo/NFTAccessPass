import { useState, useEffect, useCallback } from 'react';

import { CheckResponse } from '@/types';

/**
 * Custom hook to check if an address holds the Access Pass NFT.
 * 
 * @param address - The wallet address to check.
 * @returns Object containing the access status and a function to re-check.
 */
export const useAccess = (address?: string) => {
  const [hasAccess, setHasAccess] = useState(false);
  
  /**
   * Calls the check API to verify NFT ownership.
   */
  const checkAccess = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/check?address=${address}`);
      const data: CheckResponse = await res.json();
      setHasAccess(data.hasAccess);
    } catch (error) {
      console.error(error);
      setHasAccess(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      checkAccess();
    } else {
      setHasAccess(false);
    }
  }, [address, checkAccess]);

  return { hasAccess, checkAccess };
};
