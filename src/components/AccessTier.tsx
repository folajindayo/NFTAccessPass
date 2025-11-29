/**
 * AccessTier Component
 * Display NFT access tier badge with levels
 */

import React, { useMemo } from 'react';

export type TierLevel = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface AccessTierProps {
  tier: TierLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showBenefits?: boolean;
  benefits?: string[];
  tokenCount?: number;
  nextTier?: {
    level: TierLevel;
    requiredTokens: number;
  };
  className?: string;
}

interface TierConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  gradient: string;
}

export const AccessTier: React.FC<AccessTierProps> = ({
  tier,
  size = 'md',
  showLabel = true,
  showBenefits = false,
  benefits = [],
  tokenCount,
  nextTier,
  className = '',
}) => {
  const tierConfigs: Record<TierLevel, TierConfig> = useMemo(() => ({
    none: {
      label: 'No Access',
      color: 'text-gray-500',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      borderColor: 'border-gray-300 dark:border-gray-600',
      gradient: 'from-gray-400 to-gray-500',
      icon: (
        <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
    },
    bronze: {
      label: 'Bronze',
      color: 'text-amber-700',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      borderColor: 'border-amber-400',
      gradient: 'from-amber-600 to-amber-800',
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    silver: {
      label: 'Silver',
      color: 'text-slate-600',
      bgColor: 'bg-slate-100 dark:bg-slate-800',
      borderColor: 'border-slate-400',
      gradient: 'from-slate-400 to-slate-600',
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    gold: {
      label: 'Gold',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      borderColor: 'border-yellow-500',
      gradient: 'from-yellow-400 to-yellow-600',
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    platinum: {
      label: 'Platinum',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
      borderColor: 'border-cyan-400',
      gradient: 'from-cyan-400 to-cyan-600',
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    diamond: {
      label: 'Diamond',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      borderColor: 'border-purple-400',
      gradient: 'from-purple-400 via-pink-500 to-purple-600',
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
    },
  }), []);

  const config = tierConfigs[tier];

  const sizeClasses = {
    sm: {
      badge: 'px-2 py-1',
      icon: 'w-4 h-4',
      text: 'text-xs',
    },
    md: {
      badge: 'px-3 py-1.5',
      icon: 'w-5 h-5',
      text: 'text-sm',
    },
    lg: {
      badge: 'px-4 py-2',
      icon: 'w-6 h-6',
      text: 'text-base',
    },
  };

  const sizes = sizeClasses[size];

  if (!showBenefits) {
    // Simple badge mode
    return (
      <div
        className={`inline-flex items-center gap-2 ${sizes.badge} ${config.bgColor} border ${config.borderColor} rounded-full ${className}`}
      >
        <div className={`${sizes.icon} ${config.color}`}>
          {config.icon}
        </div>
        {showLabel && (
          <span className={`font-medium ${sizes.text} ${config.color}`}>
            {config.label}
          </span>
        )}
      </div>
    );
  }

  // Card mode with benefits
  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg ${className}`}>
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${config.gradient} p-6 text-white`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <div className="w-10 h-10 text-white">
              {config.icon}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold">{config.label}</h3>
            {tokenCount !== undefined && (
              <p className="text-white/80">
                {tokenCount} {tokenCount === 1 ? 'NFT' : 'NFTs'} owned
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="p-6 bg-white dark:bg-slate-900">
        {benefits.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              Your Benefits
            </h4>
            <ul className="space-y-2">
              {benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <svg className={`w-5 h-5 ${config.color}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Progress to next tier */}
        {nextTier && tokenCount !== undefined && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500 dark:text-gray-400">
                Progress to {tierConfigs[nextTier.level].label}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {tokenCount}/{nextTier.requiredTokens}
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${tierConfigs[nextTier.level].gradient} transition-all duration-500`}
                style={{ width: `${Math.min((tokenCount / nextTier.requiredTokens) * 100, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {nextTier.requiredTokens - tokenCount} more NFT{nextTier.requiredTokens - tokenCount !== 1 ? 's' : ''} needed
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(AccessTier);
