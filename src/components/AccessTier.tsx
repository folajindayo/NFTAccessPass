import React from 'react';

export type TierLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface AccessTierProps {
  tier: TierLevel;
  tokenCount?: number;
  nextTierAt?: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface TierConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  glowColor: string;
}

const tierConfigs: Record<TierLevel, TierConfig> = {
  bronze: {
    label: 'Bronze',
    color: 'text-amber-700 dark:text-amber-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-300 dark:border-amber-700',
    icon: '🥉',
    glowColor: 'shadow-amber-500/20',
  },
  silver: {
    label: 'Silver',
    color: 'text-gray-600 dark:text-gray-300',
    bgColor: 'bg-gray-100 dark:bg-gray-800/50',
    borderColor: 'border-gray-300 dark:border-gray-600',
    icon: '🥈',
    glowColor: 'shadow-gray-500/20',
  },
  gold: {
    label: 'Gold',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-400 dark:border-yellow-600',
    icon: '🥇',
    glowColor: 'shadow-yellow-500/30',
  },
  platinum: {
    label: 'Platinum',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/30',
    borderColor: 'border-cyan-400 dark:border-cyan-600',
    icon: '💎',
    glowColor: 'shadow-cyan-500/30',
  },
  diamond: {
    label: 'Diamond',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    borderColor: 'border-purple-400 dark:border-purple-600',
    icon: '👑',
    glowColor: 'shadow-purple-500/40',
  },
};

const tierOrder: TierLevel[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

const sizeClasses = {
  sm: {
    badge: 'px-2 py-1 text-xs',
    icon: 'text-sm',
    progress: 'h-1',
  },
  md: {
    badge: 'px-3 py-1.5 text-sm',
    icon: 'text-base',
    progress: 'h-1.5',
  },
  lg: {
    badge: 'px-4 py-2 text-base',
    icon: 'text-lg',
    progress: 'h-2',
  },
};

/**
 * AccessTier displays the user's current access tier level with optional progress to next tier.
 * Supports multiple tier levels with distinct visual styling.
 */
export const AccessTier: React.FC<AccessTierProps> = ({
  tier,
  tokenCount = 0,
  nextTierAt,
  showProgress = false,
  size = 'md',
  className = '',
}) => {
  const config = tierConfigs[tier];
  const sizes = sizeClasses[size];
  
  const currentTierIndex = tierOrder.indexOf(tier);
  const isMaxTier = currentTierIndex === tierOrder.length - 1;
  
  const progressPercent = nextTierAt && !isMaxTier
    ? Math.min((tokenCount / nextTierAt) * 100, 100)
    : 100;

  const getNextTierName = (): string | null => {
    if (isMaxTier) return null;
    return tierConfigs[tierOrder[currentTierIndex + 1]].label;
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border ${config.bgColor} ${config.borderColor} ${sizes.badge} shadow-lg ${config.glowColor}`}
      >
        <span className={sizes.icon}>{config.icon}</span>
        <span className={`font-semibold ${config.color}`}>
          {config.label}
        </span>
        {tokenCount > 0 && (
          <span className={`${config.color} opacity-70`}>
            ({tokenCount})
          </span>
        )}
      </div>

      {showProgress && !isMaxTier && nextTierAt && (
        <div className="mt-2 w-full">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Progress to {getNextTierName()}
            </span>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {tokenCount}/{nextTierAt}
            </span>
          </div>
          <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${sizes.progress}`}>
            <div
              className={`${sizes.progress} rounded-full transition-all duration-500 bg-gradient-to-r ${
                tier === 'bronze' ? 'from-amber-500 to-gray-400' :
                tier === 'silver' ? 'from-gray-400 to-yellow-500' :
                tier === 'gold' ? 'from-yellow-500 to-cyan-500' :
                'from-cyan-500 to-purple-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {showProgress && isMaxTier && (
        <div className="mt-2 text-center">
          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
            Maximum tier reached! ✨
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Helper function to determine tier based on token count
 */
export const getTierFromCount = (count: number): TierLevel => {
  if (count >= 50) return 'diamond';
  if (count >= 25) return 'platinum';
  if (count >= 10) return 'gold';
  if (count >= 5) return 'silver';
  return 'bronze';
};

/**
 * Helper function to get the next tier threshold
 */
export const getNextTierThreshold = (currentTier: TierLevel): number | null => {
  const thresholds: Record<TierLevel, number | null> = {
    bronze: 5,
    silver: 10,
    gold: 25,
    platinum: 50,
    diamond: null,
  };
  return thresholds[currentTier];
};

export default AccessTier;

