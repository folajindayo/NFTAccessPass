import React from 'react';
import { spacing, borders, colors } from '@/theme';

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  rounded?: boolean;
  background?: 'default' | 'muted' | 'none';
}

/**
 * Standardized Box component for layout and container styles.
 */
export const Box: React.FC<BoxProps> = ({ 
  children, 
  className = '',
  padding = 'none',
  border = false,
  rounded = false,
  background = 'none',
  ...props 
}) => {
  const paddings = {
    none: '',
    sm: spacing.padding.small,
    md: spacing.padding.medium,
    lg: spacing.padding.large
  };

  const backgrounds = {
    default: colors.surface,
    muted: 'bg-gray-50',
    none: ''
  };

  const borderStyle = border ? `${borders.width.default} ${colors.border.default}` : '';
  const roundedStyle = rounded ? borders.radius.lg : '';

  return (
    <div 
      className={`${paddings[padding]} ${borderStyle} ${roundedStyle} ${backgrounds[background]} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};


