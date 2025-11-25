import { useState, useCallback } from 'react';

import { MintResponse } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * Custom hook to handle the NFT minting process.
 * 
 * @param address - The wallet address to mint the NFT for.
 * @param onSuccess - Optional callback function to run after successful minting.
 * @returns Object containing the mint function, loading state, and status message.
 */
export const useMint = (address?: string, onSuccess?: () => void) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { t } = useTranslation();

  /**
   * Triggers the minting API call.
   * Updates loading state and messages based on the outcome.
   */
  const mintPass = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setMessage(t('common.minting'));
    try {
      const res = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data: MintResponse = await res.json();
      if (data.success) {
        setMessage(t('common.mintSuccess'));
        if (onSuccess) onSuccess();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(t('common.mintError'));
    } finally {
      setLoading(false);
    }
  }, [address, onSuccess, t]);

  return { mintPass, loading, message, setMessage };
};
