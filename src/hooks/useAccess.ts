import { useState, useEffect, useCallback } from 'react';
import { CheckResponse } from '@/types';

export const useAccess = (address?: string) => {
  const [hasAccess, setHasAccess] = useState(false);
  
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

