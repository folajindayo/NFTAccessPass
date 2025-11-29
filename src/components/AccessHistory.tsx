import React from 'react';

import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';
import { LockIcon } from './icons/LockIcon';
import { UnlockIcon } from './icons/UnlockIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

export type AccessEventType = 
  | 'access_granted'
  | 'access_revoked'
  | 'token_minted'
  | 'token_transferred'
  | 'tier_upgraded'
  | 'tier_downgraded'
  | 'access_expired';

export interface AccessEvent {
  id: string;
  type: AccessEventType;
  timestamp: Date;
  txHash?: string;
  tokenId?: string;
  fromAddress?: string;
  toAddress?: string;
  previousTier?: string;
  newTier?: string;
  metadata?: Record<string, unknown>;
}

export interface AccessHistoryProps {
  events: AccessEvent[];
  loading?: boolean;
  emptyMessage?: string;
  onViewTransaction?: (txHash: string) => void;
  maxItems?: number;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

const eventConfig: Record<AccessEventType, {
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  color: string;
}> = {
  access_granted: {
    label: 'Access Granted',
    icon: <UnlockIcon className="w-4 h-4" />,
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    color: 'text-green-600 dark:text-green-400',
  },
  access_revoked: {
    label: 'Access Revoked',
    icon: <LockIcon className="w-4 h-4" />,
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    color: 'text-red-600 dark:text-red-400',
  },
  token_minted: {
    label: 'NFT Minted',
    icon: <CheckIcon className="w-4 h-4" />,
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    color: 'text-blue-600 dark:text-blue-400',
  },
  token_transferred: {
    label: 'Token Transferred',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    color: 'text-purple-600 dark:text-purple-400',
  },
  tier_upgraded: {
    label: 'Tier Upgraded',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    color: 'text-amber-600 dark:text-amber-400',
  },
  tier_downgraded: {
    label: 'Tier Downgraded',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    color: 'text-gray-600 dark:text-gray-400',
  },
  access_expired: {
    label: 'Access Expired',
    icon: <XIcon className="w-4 h-4" />,
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    color: 'text-orange-600 dark:text-orange-400',
  },
};

/**
 * AccessHistory displays a timeline of access-related events.
 * Shows minting, transfers, tier changes, and access status changes.
 */
export const AccessHistory: React.FC<AccessHistoryProps> = ({
  events,
  loading = false,
  emptyMessage = 'No access history found',
  onViewTransaction,
  maxItems,
  showLoadMore = false,
  onLoadMore,
  className = '',
}) => {
  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: days > 365 ? 'numeric' : undefined,
      }).format(date);
    }
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getEventDescription = (event: AccessEvent): string => {
    switch (event.type) {
      case 'token_minted':
        return `Token #${event.tokenId} was minted`;
      case 'token_transferred':
        return `Token #${event.tokenId} transferred${event.toAddress ? ` to ${formatAddress(event.toAddress)}` : ''}`;
      case 'tier_upgraded':
        return `Upgraded from ${event.previousTier} to ${event.newTier}`;
      case 'tier_downgraded':
        return `Downgraded from ${event.previousTier} to ${event.newTier}`;
      case 'access_granted':
        return 'Full access has been granted';
      case 'access_revoked':
        return 'Access has been revoked';
      case 'access_expired':
        return 'Access period has expired';
      default:
        return '';
    }
  };

  const displayedEvents = maxItems ? events.slice(0, maxItems) : events;

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

        <div className="space-y-6">
          {displayedEvents.map((event, index) => {
            const config = eventConfig[event.type];
            const isLast = index === displayedEvents.length - 1;

            return (
              <div key={event.id} className="relative flex gap-4">
                <div
                  className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full ${config.iconBg} ${config.color} flex items-center justify-center`}
                >
                  {config.icon}
                </div>

                <div className={`flex-1 ${!isLast ? 'pb-6' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-medium ${config.color}`}>
                        {config.label}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        {getEventDescription(event)}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>

                  {event.txHash && onViewTransaction && (
                    <button
                      onClick={() => onViewTransaction(event.txHash!)}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>View transaction</span>
                      <ExternalLinkIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showLoadMore && onLoadMore && events.length > (maxItems || 0) && (
        <button
          onClick={onLoadMore}
          className="mt-6 w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          Load more events
        </button>
      )}
    </div>
  );
};

export default AccessHistory;

