import React from 'react';

/**
 * Props for the Skeleton component
 */
interface SkeletonProps {
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Whether to render as a circle */
  circle?: boolean;
  /** Number of lines to render */
  lines?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Base skeleton animation classes
 */
const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

/**
 * A skeleton loading placeholder component.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  circle = false,
  lines = 1,
  className = '',
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${circle ? 'rounded-full' : ''} ${className}`}
      style={style}
    />
  );
};

/**
 * Skeleton for text content
 */
export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        height={16} 
        className={i === lines - 1 ? 'w-2/3' : 'w-full'} 
      />
    ))}
  </div>
);

/**
 * Skeleton for avatar
 */
export const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 32, md: 40, lg: 48 };
  return (
    <Skeleton 
      circle 
      width={sizes[size]} 
      height={sizes[size]} 
      className={className} 
    />
  );
};

/**
 * Skeleton for a card
 */
export const SkeletonCard: React.FC<{
  hasImage?: boolean;
  className?: string;
}> = ({ hasImage = true, className = '' }) => (
  <div className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
    {hasImage && (
      <Skeleton height={160} className="w-full mb-4" />
    )}
    <Skeleton height={24} className="w-3/4 mb-2" />
    <Skeleton height={16} className="w-full mb-1" />
    <Skeleton height={16} className="w-5/6" />
  </div>
);

/**
 * Skeleton for a table row
 */
export const SkeletonTableRow: React.FC<{
  columns?: number;
  className?: string;
}> = ({ columns = 4, className = '' }) => (
  <tr className={className}>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton height={16} className="w-full" />
      </td>
    ))}
  </tr>
);

/**
 * Skeleton for a list item
 */
export const SkeletonListItem: React.FC<{
  hasAvatar?: boolean;
  className?: string;
}> = ({ hasAvatar = true, className = '' }) => (
  <div className={`flex items-center gap-4 p-4 ${className}`}>
    {hasAvatar && <SkeletonAvatar />}
    <div className="flex-1">
      <Skeleton height={16} className="w-1/3 mb-2" />
      <Skeleton height={14} className="w-2/3" />
    </div>
  </div>
);

/**
 * Skeleton for NFT card
 */
export const SkeletonNFTCard: React.FC<{
  className?: string;
}> = ({ className = '' }) => (
  <div className={`border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden ${className}`}>
    <Skeleton height={200} className="w-full" />
    <div className="p-4">
      <Skeleton height={20} className="w-2/3 mb-2" />
      <Skeleton height={14} className="w-full mb-1" />
      <div className="flex justify-between items-center mt-4">
        <Skeleton height={24} className="w-1/4" />
        <Skeleton height={32} width={80} />
      </div>
    </div>
  </div>
);

export default Skeleton;

