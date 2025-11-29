import React, { useState, useRef, useEffect } from 'react';

import { WalletIcon } from './icons/WalletIcon';
import { CopyIcon } from './icons/CopyIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

export interface WalletDropdownProps {
  address: string;
  balance?: string;
  balanceSymbol?: string;
  chainId?: number;
  chainName?: string;
  ensName?: string;
  avatarUrl?: string;
  onDisconnect: () => void;
  onSwitchNetwork?: () => void;
  onViewExplorer?: (address: string) => void;
  className?: string;
}

/**
 * WalletDropdown displays connected wallet info with account options.
 * Includes copy address, view on explorer, switch network, and disconnect.
 */
export const WalletDropdown: React.FC<WalletDropdownProps> = ({
  address,
  balance,
  balanceSymbol = 'ETH',
  chainId,
  chainName,
  ensName,
  avatarUrl,
  onDisconnect,
  onSwitchNetwork,
  onViewExplorer,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (bal: string): string => {
    const num = parseFloat(bal);
    if (num === 0) return '0';
    if (num < 0.0001) return '<0.0001';
    if (num < 1) return num.toFixed(4);
    if (num < 1000) return num.toFixed(2);
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleViewExplorer = () => {
    onViewExplorer?.(address);
    setIsOpen(false);
  };

  const handleSwitchNetwork = () => {
    onSwitchNetwork?.();
    setIsOpen(false);
  };

  const handleDisconnect = () => {
    onDisconnect();
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <WalletIcon className="w-3 h-3 text-white" />
          </div>
        )}
        <span className="text-sm font-medium text-foreground">
          {ensName || formatAddress(address)}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <WalletIcon className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {ensName && (
                  <p className="font-semibold text-foreground truncate">
                    {ensName}
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {formatAddress(address)}
                </p>
              </div>
            </div>

            {balance && (
              <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatBalance(balance)} {balanceSymbol}
                </p>
              </div>
            )}

            {chainName && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Connected to {chainName}
                  {chainId && <span className="ml-1 opacity-70">(Chain {chainId})</span>}
                </span>
              </div>
            )}
          </div>

          <div className="p-2">
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {copied ? (
                <CheckIcon className="w-4 h-4 text-green-500" />
              ) : (
                <CopyIcon className="w-4 h-4" />
              )}
              <span>{copied ? 'Copied!' : 'Copy Address'}</span>
            </button>

            {onViewExplorer && (
              <button
                onClick={handleViewExplorer}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ExternalLinkIcon className="w-4 h-4" />
                <span>View on Explorer</span>
              </button>
            )}

            {onSwitchNetwork && (
              <button
                onClick={handleSwitchNetwork}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Switch Network</span>
              </button>
            )}

            <div className="my-2 border-t border-gray-100 dark:border-gray-800" />

            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletDropdown;

