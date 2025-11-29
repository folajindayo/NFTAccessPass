import React, { useState, useMemo } from 'react';

import { Card } from './ui/Card';
import { LoadingIcon } from './icons/LoadingIcon';

export interface NFTItem {
  tokenId: string;
  name: string;
  description?: string;
  image: string;
  contractAddress: string;
  chainId: number;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  owner?: string;
  lastTransfer?: Date;
}

export interface NFTGalleryProps {
  nfts: NFTItem[];
  loading?: boolean;
  columns?: 2 | 3 | 4 | 6;
  onSelect?: (nft: NFTItem) => void;
  selectedTokenId?: string;
  emptyMessage?: string;
  showAttributes?: boolean;
  className?: string;
}

const columnClasses: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
};

/**
 * NFTGallery displays a grid of owned NFTs with selection support.
 * Supports different column layouts and shows NFT metadata.
 */
export const NFTGallery: React.FC<NFTGalleryProps> = ({
  nfts,
  loading = false,
  columns = 3,
  onSelect,
  selectedTokenId,
  emptyMessage = 'No NFTs found in this wallet',
  showAttributes = false,
  className = '',
}) => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleImageError = (tokenId: string) => {
    setImageErrors(prev => new Set(prev).add(tokenId));
  };

  const sortedNfts = useMemo(() => {
    return [...nfts].sort((a, b) => {
      const aNum = parseInt(a.tokenId, 10);
      const bNum = parseInt(b.tokenId, 10);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      return a.tokenId.localeCompare(b.tokenId);
    });
  }, [nfts]);

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <LoadingIcon className="w-8 h-8 animate-spin text-blue-500" />
        <p className="mt-4 text-gray-500">Loading NFTs...</p>
      </div>
    );
  }

  if (sortedNfts.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid ${columnClasses[columns]} gap-4 ${className}`}>
      {sortedNfts.map((nft) => {
        const isSelected = selectedTokenId === nft.tokenId;
        const isHovered = hoveredId === nft.tokenId;
        const hasImageError = imageErrors.has(nft.tokenId);

        return (
          <Card
            key={`${nft.contractAddress}-${nft.tokenId}`}
            className={`overflow-hidden cursor-pointer transition-all duration-200 ${
              isSelected 
                ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' 
                : ''
            } ${isHovered ? 'shadow-lg transform -translate-y-1' : ''}`}
            onClick={() => onSelect?.(nft)}
            onMouseEnter={() => setHoveredId(nft.tokenId)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
              {hasImageError ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              ) : (
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(nft.tokenId)}
                  loading="lazy"
                />
              )}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-foreground truncate">
                {nft.name || `#${nft.tokenId}`}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Token ID: {nft.tokenId}
              </p>
              
              {nft.owner && (
                <p className="text-xs text-gray-400 mt-1">
                  Owner: {formatAddress(nft.owner)}
                </p>
              )}

              {showAttributes && nft.attributes && nft.attributes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {nft.attributes.slice(0, 3).map((attr, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    >
                      {attr.trait_type}: {attr.value}
                    </span>
                  ))}
                  {nft.attributes.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-500">
                      +{nft.attributes.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default NFTGallery;

