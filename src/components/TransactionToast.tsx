import React, { useEffect, useState } from 'react';

import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';
import { LoadingIcon } from './icons/LoadingIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

export type TransactionStatus = 'pending' | 'success' | 'error';

export interface TransactionToastProps {
  status: TransactionStatus;
  message: string;
  txHash?: string;
  explorerUrl?: string;
  duration?: number;
  onClose?: () => void;
  onViewTransaction?: (hash: string) => void;
  className?: string;
}

const statusConfig: Record<TransactionStatus, {
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  iconBg: string;
}> = {
  pending: {
    icon: <LoadingIcon className="w-5 h-5 text-blue-600 animate-spin" />,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
  },
  success: {
    icon: <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    iconBg: 'bg-green-100 dark:bg-green-900/40',
  },
  error: {
    icon: <XIcon className="w-5 h-5 text-red-600 dark:text-red-400" />,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
  },
};

/**
 * TransactionToast displays transaction status notifications.
 * Shows pending, success, or error states with optional explorer link.
 */
export const TransactionToast: React.FC<TransactionToastProps> = ({
  status,
  message,
  txHash,
  explorerUrl,
  duration = 5000,
  onClose,
  onViewTransaction,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const config = statusConfig[status];

  const formatTxHash = (hash: string): string => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 200);
  };

  const handleViewTransaction = () => {
    if (txHash) {
      if (explorerUrl) {
        window.open(`${explorerUrl}/tx/${txHash}`, '_blank');
      }
      onViewTransaction?.(txHash);
    }
  };

  useEffect(() => {
    if (status !== 'pending' && duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [status, duration]);

  if (!isVisible) return null;

  return (
    <div
      className={`
        ${config.bgColor} ${config.borderColor}
        border rounded-lg shadow-lg p-4 max-w-sm w-full
        transform transition-all duration-200
        ${isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
        ${className}
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.iconBg} flex items-center justify-center`}>
          {config.icon}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {status === 'pending' && 'Transaction Pending'}
            {status === 'success' && 'Transaction Successful'}
            {status === 'error' && 'Transaction Failed'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            {message}
          </p>

          {txHash && (
            <div className="mt-2 flex items-center gap-2">
              <code className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                {formatTxHash(txHash)}
              </code>
              {(explorerUrl || onViewTransaction) && (
                <button
                  onClick={handleViewTransaction}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>View</span>
                  <ExternalLinkIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          aria-label="Close notification"
        >
          <XIcon className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {status === 'pending' && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
            <div className="bg-blue-500 h-1 rounded-full animate-pulse w-full" />
          </div>
        </div>
      )}
    </div>
  );
};

export interface TransactionToastContainerProps {
  toasts: Array<TransactionToastProps & { id: string }>;
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const positionClasses: Record<string, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
};

/**
 * Container component for managing multiple transaction toasts.
 */
export const TransactionToastContainer: React.FC<TransactionToastContainerProps> = ({
  toasts,
  onRemove,
  position = 'top-right',
}) => {
  return (
    <div className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-2`}>
      {toasts.map((toast) => (
        <TransactionToast
          key={toast.id}
          {...toast}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};

export default TransactionToast;

