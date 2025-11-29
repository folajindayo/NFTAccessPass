import React from 'react';

import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { LockIcon } from './icons/LockIcon';
import { UnlockIcon } from './icons/UnlockIcon';
import { ShieldIcon } from './icons/ShieldIcon';

export type AccessStatus = 'granted' | 'denied' | 'pending' | 'checking';

export interface TokenGateCardProps {
  status: AccessStatus;
  tokenName: string;
  requiredBalance?: number;
  currentBalance?: number;
  contractAddress?: string;
  chainId?: number;
  expiresAt?: Date;
  onRequestAccess?: () => void;
  className?: string;
}

const statusConfig: Record<AccessStatus, { 
  label: string; 
  variant: 'success' | 'error' | 'warning' | 'default';
  icon: React.ReactNode;
}> = {
  granted: { 
    label: 'Access Granted', 
    variant: 'success',
    icon: <UnlockIcon className="w-5 h-5" />
  },
  denied: { 
    label: 'Access Denied', 
    variant: 'error',
    icon: <LockIcon className="w-5 h-5" />
  },
  pending: { 
    label: 'Pending Verification', 
    variant: 'warning',
    icon: <ShieldIcon className="w-5 h-5" />
  },
  checking: { 
    label: 'Checking Access...', 
    variant: 'default',
    icon: <ShieldIcon className="w-5 h-5 animate-pulse" />
  },
};

/**
 * TokenGateCard displays the current access status for a token-gated resource.
 * Shows token requirements, current balance, and access expiration if applicable.
 */
export const TokenGateCard: React.FC<TokenGateCardProps> = ({
  status,
  tokenName,
  requiredBalance = 1,
  currentBalance = 0,
  contractAddress,
  chainId,
  expiresAt,
  onRequestAccess,
  className = '',
}) => {
  const config = statusConfig[status];
  const progress = Math.min((currentBalance / requiredBalance) * 100, 100);
  const isAccessible = status === 'granted';
  const needsMore = currentBalance < requiredBalance;

  const formatAddress = (address: string): string => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatExpiration = (date: Date): string => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return 'Expiring soon';
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isAccessible ? 'bg-green-500/10' : 'bg-gray-500/10'
          }`}>
            {config.icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">
              Token Gate
            </h3>
            <p className="text-sm text-gray-500">
              {tokenName}
            </p>
          </div>
        </div>
        <Badge variant={config.variant}>
          {config.label}
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Balance Progress
            </span>
            <span className="text-sm font-medium">
              {currentBalance} / {requiredBalance}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                isAccessible ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {contractAddress && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Contract</span>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
              {formatAddress(contractAddress)}
            </code>
          </div>
        )}

        {chainId && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Chain ID</span>
            <span className="font-mono">{chainId}</span>
          </div>
        )}

        {expiresAt && isAccessible && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Expires</span>
            <span className="text-amber-600 dark:text-amber-400">
              {formatExpiration(expiresAt)}
            </span>
          </div>
        )}

        {needsMore && status === 'denied' && onRequestAccess && (
          <button
            onClick={onRequestAccess}
            className="w-full mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Get {requiredBalance - currentBalance} More {tokenName}
          </button>
        )}
      </div>
    </Card>
  );
};

export default TokenGateCard;

