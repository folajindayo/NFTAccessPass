import { useState, useCallback } from 'react';
import { MintResponse } from '@/types';

export const useMint = (address?: string, onSuccess?: () => void) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const mintPass = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setMessage('Minting...');
    try {
      const res = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data: MintResponse = await res.json();
      if (data.success) {
        setMessage('Minted successfully! Checking access...');
        if (onSuccess) onSuccess();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Minting failed');
    } finally {
      setLoading(false);
    }
  }, [address, onSuccess]);

  return { mintPass, loading, message, setMessage };
};

