import React from 'react';

export type NetworkStatus = 'connected' | 'disconnected' | 'switching' | 'unsupported';

export interface NetworkInfo {
  chainId: number;
  name: string;
  shortName?: string;
  currency: string;
  color?: string;
  iconUrl?: string;
  isTestnet?: boolean;
}

export interface NetworkBadgeProps {
  network: NetworkInfo;
  status?: NetworkStatus;
  showStatus?: boolean;
  showChainId?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  onClick?: () => void;
  className?: string;
}

const defaultNetworks: Record<number, Partial<NetworkInfo>> = {
  1: { name: 'Ethereum', shortName: 'ETH', color: '#627EEA', currency: 'ETH' },
  5: { name: 'Goerli', shortName: 'GOR', color: '#627EEA', currency: 'ETH', isTestnet: true },
  11155111: { name: 'Sepolia', shortName: 'SEP', color: '#627EEA', currency: 'ETH', isTestnet: true },
  137: { name: 'Polygon', shortName: 'MATIC', color: '#8247E5', currency: 'MATIC' },
  80001: { name: 'Mumbai', shortName: 'MUM', color: '#8247E5', currency: 'MATIC', isTestnet: true },
  42161: { name: 'Arbitrum', shortName: 'ARB', color: '#28A0F0', currency: 'ETH' },
  10: { name: 'Optimism', shortName: 'OP', color: '#FF0420', currency: 'ETH' },
  56: { name: 'BNB Chain', shortName: 'BNB', color: '#F3BA2F', currency: 'BNB' },
  43114: { name: 'Avalanche', shortName: 'AVAX', color: '#E84142', currency: 'AVAX' },
  8453: { name: 'Base', shortName: 'BASE', color: '#0052FF', currency: 'ETH' },
  84532: { name: 'Base Sepolia', shortName: 'BSEP', color: '#0052FF', currency: 'ETH', isTestnet: true },
};

const sizeClasses = {
  sm: { badge: 'px-2 py-0.5 text-xs', icon: 'w-3 h-3', dot: 'w-1.5 h-1.5' },
  md: { badge: 'px-3 py-1 text-sm', icon: 'w-4 h-4', dot: 'w-2 h-2' },
  lg: { badge: 'px-4 py-1.5 text-base', icon: 'w-5 h-5', dot: 'w-2.5 h-2.5' },
};

const statusColors: Record<NetworkStatus, string> = {
  connected: 'bg-green-500',
  disconnected: 'bg-gray-400',
  switching: 'bg-yellow-500 animate-pulse',
  unsupported: 'bg-red-500',
};

/**
 * NetworkBadge displays the current blockchain network with status indicator.
 * Shows network name, icon, and connection status.
 */
export const NetworkBadge: React.FC<NetworkBadgeProps> = ({
  network,
  status = 'connected',
  showStatus = true,
  showChainId = false,
  size = 'md',
  variant = 'default',
  onClick,
  className = '',
}) => {
  const sizes = sizeClasses[size];
  const defaultInfo = defaultNetworks[network.chainId] || {};
  const mergedNetwork = { ...defaultInfo, ...network };
  const networkColor = mergedNetwork.color || '#6B7280';

  const variantClasses = {
    default: 'bg-gray-100 dark:bg-gray-800 border-transparent',
    outline: 'bg-transparent border-gray-300 dark:border-gray-600',
    ghost: 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
  };

  const isClickable = !!onClick;

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full border
        ${variantClasses[variant]}
        ${sizes.badge}
        ${isClickable ? 'cursor-pointer transition-colors' : ''}
        ${className}
      `}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
    >
      {showStatus && (
        <span className={`${sizes.dot} rounded-full ${statusColors[status]}`} />
      )}

      {mergedNetwork.iconUrl ? (
        <img
          src={mergedNetwork.iconUrl}
          alt={mergedNetwork.name}
          className={`${sizes.icon} rounded-full`}
        />
      ) : (
        <div
          className={`${sizes.icon} rounded-full flex items-center justify-center text-white font-bold`}
          style={{ backgroundColor: networkColor }}
        >
          <span style={{ fontSize: size === 'sm' ? '6px' : size === 'md' ? '8px' : '10px' }}>
            {(mergedNetwork.shortName || mergedNetwork.name).charAt(0)}
          </span>
        </div>
      )}

      <span className="font-medium text-foreground">
        {mergedNetwork.shortName || mergedNetwork.name}
      </span>

      {showChainId && (
        <span className="text-gray-500 dark:text-gray-400">
          ({network.chainId})
        </span>
      )}

      {mergedNetwork.isTestnet && (
        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
          Testnet
        </span>
      )}

      {isClickable && (
        <svg
          className={`${sizes.icon} text-gray-400`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      )}
    </div>
  );
};

export interface NetworkSelectorProps {
  currentChainId: number;
  networks: NetworkInfo[];
  onSelect: (chainId: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * NetworkSelector provides a dropdown to switch between networks.
 */
export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  currentChainId,
  networks,
  onSelect,
  isOpen,
  onToggle,
  className = '',
}) => {
  const currentNetwork = networks.find(n => n.chainId === currentChainId) || {
    chainId: currentChainId,
    name: `Chain ${currentChainId}`,
    currency: 'ETH',
  };

  return (
    <div className={`relative ${className}`}>
      <NetworkBadge
        network={currentNetwork}
        onClick={onToggle}
        variant="outline"
      />

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="p-2">
            <p className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Select Network
            </p>
            {networks.map((network) => {
              const isSelected = network.chainId === currentChainId;
              const defaultInfo = defaultNetworks[network.chainId] || {};
              const mergedNetwork = { ...defaultInfo, ...network };

              return (
                <button
                  key={network.chainId}
                  onClick={() => {
                    onSelect(network.chainId);
                    onToggle();
                  }}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: mergedNetwork.color || '#6B7280' }}
                  >
                    {(mergedNetwork.shortName || mergedNetwork.name).charAt(0)}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}`}>
                      {mergedNetwork.name}
                    </p>
                  </div>
                  {isSelected && (
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {mergedNetwork.isTestnet && (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
                      Test
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkBadge;

