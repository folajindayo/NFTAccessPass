import React from 'react';

import { WalletIcon } from '../icons/WalletIcon';
import { LoadingIcon } from '../icons/LoadingIcon';

export interface WalletConnectButtonProps {
  isConnecting?: boolean;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
  secondary: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-foreground border-transparent',
  outline: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground border-gray-300 dark:border-gray-600',
};

/**
 * WalletConnectButton provides a styled button for wallet connection.
 * Supports multiple variants and shows loading state during connection.
 */
export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  isConnecting = false,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isConnecting}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        border transition-colors disabled:opacity-60 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {isConnecting ? (
        <>
          <LoadingIcon className="w-5 h-5 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <WalletIcon className="w-5 h-5" />
          <span>Connect Wallet</span>
        </>
      )}
    </button>
  );
};

export default WalletConnectButton;

