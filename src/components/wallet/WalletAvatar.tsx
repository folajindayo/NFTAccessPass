import React, { useMemo } from 'react';

export interface WalletAvatarProps {
  address: string;
  ensAvatar?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

/**
 * WalletAvatar displays a visual representation of a wallet address.
 * Shows ENS avatar if available, otherwise generates a gradient based on address.
 */
export const WalletAvatar: React.FC<WalletAvatarProps> = ({
  address,
  ensAvatar,
  size = 'md',
  className = '',
}) => {
  const gradientColors = useMemo(() => {
    if (!address) return ['#6366f1', '#8b5cf6'];
    
    const hash = address.toLowerCase().slice(2, 10);
    const hue1 = parseInt(hash.slice(0, 4), 16) % 360;
    const hue2 = (hue1 + 40) % 360;
    
    return [
      `hsl(${hue1}, 70%, 50%)`,
      `hsl(${hue2}, 70%, 50%)`,
    ];
  }, [address]);

  const initials = useMemo(() => {
    if (!address) return '?';
    return address.slice(2, 4).toUpperCase();
  }, [address]);

  if (ensAvatar) {
    return (
      <img
        src={ensAvatar}
        alt="Wallet avatar"
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white ${sizeClasses[size]} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`,
        fontSize: size === 'xs' ? '8px' : size === 'sm' ? '10px' : size === 'md' ? '12px' : size === 'lg' ? '14px' : '18px',
      }}
    >
      {initials}
    </div>
  );
};

export default WalletAvatar;

