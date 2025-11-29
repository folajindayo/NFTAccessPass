import React from 'react';

export interface WalletStatusProps {
  isConnected: boolean;
  isConnecting?: boolean;
  address?: string;
  ensName?: string;
  chainName?: string;
  className?: string;
}

/**
 * WalletStatus displays the current wallet connection status.
 * Shows connected address or connection state.
 */
export const WalletStatus: React.FC<WalletStatusProps> = ({
  isConnected,
  isConnecting = false,
  address,
  ensName,
  chainName,
  className = '',
}) => {
  const formatAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnecting) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        <span className="text-sm text-gray-500">Connecting...</span>
      </div>
    );
  }

  if (!isConnected || !address) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-2 h-2 rounded-full bg-gray-400" />
        <span className="text-sm text-gray-500">Not connected</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-2 h-2 rounded-full bg-green-500" />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">
          {ensName || formatAddress(address)}
        </span>
        {chainName && (
          <span className="text-xs text-gray-500">{chainName}</span>
        )}
      </div>
    </div>
  );
};

export default WalletStatus;

