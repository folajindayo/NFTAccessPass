import React, { useEffect, useState } from 'react';

import { XIcon } from './icons/XIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
  max_value?: number;
}

export interface NFTMetadata {
  tokenId: string;
  name: string;
  description?: string;
  image: string;
  externalUrl?: string;
  animationUrl?: string;
  attributes?: NFTAttribute[];
  contractAddress: string;
  chainId: number;
  owner?: string;
  tokenStandard?: 'ERC721' | 'ERC1155';
  supply?: number;
  mintedAt?: Date;
}

export interface NFTPreviewProps {
  nft: NFTMetadata;
  isOpen: boolean;
  onClose: () => void;
  onViewOnMarketplace?: (nft: NFTMetadata) => void;
  onTransfer?: (nft: NFTMetadata) => void;
  explorerUrl?: string;
  className?: string;
}

/**
 * NFTPreview displays a modal with detailed NFT information and metadata.
 * Shows image, attributes, contract info, and action buttons.
 */
export const NFTPreview: React.FC<NFTPreviewProps> = ({
  nft,
  isOpen,
  onClose,
  onViewOnMarketplace,
  onTransfer,
  explorerUrl,
  className = '',
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleViewOnExplorer = () => {
    if (explorerUrl) {
      window.open(`${explorerUrl}/token/${nft.contractAddress}?a=${nft.tokenId}`, '_blank');
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
            aria-label="Close preview"
          >
            <XIcon className="w-5 h-5 text-white" />
          </button>

          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 bg-gray-100 dark:bg-gray-800 relative aspect-square">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {imageError ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              ) : (
                <img
                  src={nft.image}
                  alt={nft.name}
                  className={`w-full h-full object-contain transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              )}
            </div>

            <div className="md:w-1/2 p-6 overflow-y-auto max-h-[60vh] md:max-h-[90vh]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {nft.name || `Token #${nft.tokenId}`}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    #{nft.tokenId} {nft.tokenStandard && `• ${nft.tokenStandard}`}
                  </p>
                </div>
              </div>

              {nft.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                  {nft.description}
                </p>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500">Contract</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono">{formatAddress(nft.contractAddress)}</code>
                    <button
                      onClick={() => handleCopy(nft.contractAddress, 'contract')}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                      {copiedField === 'contract' ? (
                        <CheckIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <CopyIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {nft.owner && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-gray-500">Owner</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono">{formatAddress(nft.owner)}</code>
                      <button
                        onClick={() => handleCopy(nft.owner!, 'owner')}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      >
                        {copiedField === 'owner' ? (
                          <CheckIcon className="w-4 h-4 text-green-500" />
                        ) : (
                          <CopyIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500">Chain ID</span>
                  <span className="text-sm font-medium">{nft.chainId}</span>
                </div>

                {nft.mintedAt && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-gray-500">Minted</span>
                    <span className="text-sm">{formatDate(nft.mintedAt)}</span>
                  </div>
                )}
              </div>

              {nft.attributes && nft.attributes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Attributes</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {nft.attributes.map((attr, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3"
                      >
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          {attr.trait_type}
                        </p>
                        <p className="text-sm font-medium text-foreground mt-1">
                          {attr.value}
                          {attr.max_value && (
                            <span className="text-gray-400"> / {attr.max_value}</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                {explorerUrl && (
                  <button
                    onClick={handleViewOnExplorer}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ExternalLinkIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">View on Explorer</span>
                  </button>
                )}
                {onViewOnMarketplace && (
                  <button
                    onClick={() => onViewOnMarketplace(nft)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <span className="text-sm font-medium">View on Marketplace</span>
                  </button>
                )}
                {onTransfer && (
                  <button
                    onClick={() => onTransfer(nft)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <span className="text-sm font-medium">Transfer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTPreview;

