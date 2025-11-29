/**
 * SkeletonLoader Component
 * Loading placeholder with shimmer effect
 */

import React from 'react';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Base skeleton component
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  className = '',
  variant = 'rectangular',
  animation = 'pulse',
}) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  return (
    <div
      className={`
        bg-foreground/10
        ${variantClasses[variant]}
        ${animationClasses[animation]}
        ${className}
      `}
      style={{ width, height }}
    />
  );
};

/**
 * Skeleton for NFT card
 */
export const NFTCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`rounded-xl bg-foreground/5 p-4 ${className}`}>
    <Skeleton variant="rounded" height={200} className="mb-4" />
    <Skeleton variant="text" width="70%" height={24} className="mb-2" />
    <Skeleton variant="text" width="40%" height={16} className="mb-4" />
    <div className="flex justify-between items-center">
      <Skeleton variant="text" width="30%" height={20} />
      <Skeleton variant="rounded" width={80} height={32} />
    </div>
  </div>
);

/**
 * Skeleton for wallet card
 */
export const WalletCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`rounded-xl bg-foreground/5 p-6 ${className}`}>
    <div className="flex items-center gap-4 mb-6">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" height={20} className="mb-2" />
        <Skeleton variant="text" width="40%" height={14} />
      </div>
    </div>
    <div className="flex justify-between items-center">
      <Skeleton variant="text" width="30%" height={24} />
      <Skeleton variant="rounded" width={100} height={36} />
    </div>
  </div>
);

/**
 * Skeleton for transaction row
 */
export const TransactionRowSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-4 p-4 ${className}`}>
    <Skeleton variant="circular" width={40} height={40} />
    <div className="flex-1">
      <Skeleton variant="text" width="50%" height={16} className="mb-1" />
      <Skeleton variant="text" width="30%" height={12} />
    </div>
    <div className="text-right">
      <Skeleton variant="text" width={80} height={16} className="mb-1" />
      <Skeleton variant="text" width={60} height={12} />
    </div>
  </div>
);

/**
 * Skeleton for access card
 */
export const AccessCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`rounded-xl bg-foreground/5 p-8 text-center ${className}`}>
    <Skeleton variant="circular" width={80} height={80} className="mx-auto mb-6" />
    <Skeleton variant="text" width="60%" height={28} className="mx-auto mb-4" />
    <Skeleton variant="text" width="80%" height={16} className="mx-auto mb-6" />
    <Skeleton variant="rounded" width={160} height={44} className="mx-auto" />
  </div>
);

/**
 * Skeleton list generator
 */
export interface SkeletonListProps {
  count: number;
  children: React.ReactNode;
  gap?: number;
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count,
  children,
  gap = 16,
  className = '',
}) => (
  <div className={`flex flex-col ${className}`} style={{ gap }}>
    {Array.from({ length: count }).map((_, index) => (
      <React.Fragment key={index}>{children}</React.Fragment>
    ))}
  </div>
);

/**
 * Skeleton grid generator
 */
export interface SkeletonGridProps {
  count: number;
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({
  count,
  children,
  columns = 3,
  gap = 16,
  className = '',
}) => (
  <div
    className={`grid ${className}`}
    style={{
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gap,
    }}
  >
    {Array.from({ length: count }).map((_, index) => (
      <React.Fragment key={index}>{children}</React.Fragment>
    ))}
  </div>
);

export default Skeleton;

