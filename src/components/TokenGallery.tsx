/**
 * TokenGallery Component
 * Grid display for owned NFTs
 */

import React, { useState, useMemo, useCallback } from 'react';

export interface NFTMetadata {
  name: string;
  description?: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface NFTToken {
  tokenId: string;
  contractAddress: string;
  owner: string;
  metadata: NFTMetadata;
  balance?: number;
  isERC1155?: boolean;
}

export interface TokenGalleryProps {
  tokens: NFTToken[];
  onTokenClick?: (token: NFTToken) => void;
  onTransfer?: (token: NFTToken) => void;
  columns?: 2 | 3 | 4 | 6;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const TokenGallery: React.FC<TokenGalleryProps> = ({
  tokens,
  onTokenClick,
  onTransfer,
  columns = 4,
  loading = false,
  emptyMessage = 'No NFTs found',
  className = '',
}) => {
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [imageError, setImageError] = useState<Set<string>>(new Set());

  const gridCols = useMemo(() => {
    const colsMap: Record<number, string> = {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
    };
    return colsMap[columns];
  }, [columns]);

  const handleTokenClick = useCallback((token: NFTToken) => {
    setSelectedTokenId(token.tokenId);
    onTokenClick?.(token);
  }, [onTokenClick]);

  const handleImageError = useCallback((tokenId: string) => {
    setImageError(prev => new Set(prev).add(tokenId));
  }, []);

  const getImageUrl = useCallback((url: string) => {
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    return url;
  }, []);

  if (loading) {
    return (
      <div className={`grid ${gridCols} gap-4 ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <div className="w-20 h-20 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols} gap-4 ${className}`}>
      {tokens.map((token) => (
        <div
          key={`${token.contractAddress}-${token.tokenId}`}
          onClick={() => handleTokenClick(token)}
          className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
            selectedTokenId === token.tokenId ? 'ring-2 ring-purple-500' : ''
          }`}
        >
          {/* Image */}
          <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-900">
            {imageError.has(token.tokenId) ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-4">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-gray-500">{token.metadata.name}</p>
                </div>
              </div>
            ) : (
              <img
                src={getImageUrl(token.metadata.image)}
                alt={token.metadata.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                onError={() => handleImageError(token.tokenId)}
                loading="lazy"
              />
            )}

            {/* Balance Badge (for ERC1155) */}
            {token.isERC1155 && token.balance && token.balance > 1 && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                x{token.balance}
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
              {token.metadata.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              #{token.tokenId}
            </p>
          </div>

          {/* Actions (on hover) */}
          {onTransfer && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTransfer(token);
                }}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors"
              >
                Transfer
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default React.memo(TokenGallery);

