import React from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { AccessCardProps } from '@/types';

/**
 * Component to display the user's access status.
 * Shows a success card if they have access, or a mint button if they don't.
 * 
 * @param props - AccessCardProps including connection status, access flag, and callbacks.
 */
export const AccessCard = ({ 
  isConnected, 
  hasAccess, 
  loading, 
  message, 
  onMint 
}: AccessCardProps) => {
  if (!isConnected) {
    return <p className="text-gray-400">Connect your wallet to check access.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {hasAccess ? (
        <Card variant="success">
          <h2 className="text-2xl font-bold">Access Granted ✅</h2>
          <p>You hold the NFT Access Pass.</p>
        </Card>
      ) : (
        <Card>
          <h2 className="text-xl">No Access Pass Found</h2>
          <Button
            onClick={onMint}
            isLoading={loading}
          >
            Mint Access Pass
          </Button>
        </Card>
      )}
      {message && <p className="mt-4 text-sm text-gray-300">{message}</p>}
    </div>
  );
};
