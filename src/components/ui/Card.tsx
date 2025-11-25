import React from 'react';

import { colors, spacing, borders, shadows } from '@/theme';

/**
 * Props for the Card component.
 */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Content to display inside the card. */
  children: React.ReactNode;
  /** Additional CSS classes. */
  className?: string;
  /** Visual style variant of the card. */
  variant?: 'default' | 'success' | 'error' | 'ghost';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * A container component for grouping content with standardized styling.
 * 
 * @param props - CardProps
 * @returns A styled div element.
 */
export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  variant = 'default',
  padding = 'md',
  ...props
}) => {
  const baseStyles = `${borders.radius.xl} flex flex-col items-center ${spacing.gap.small} transition-all duration-200`;
  
  const variants = {
    default: `${colors.surface} ${colors.border.default} ${borders.width.default} ${colors.text.primary} ${shadows.md}`,
    success: `${colors.surfaceSuccess} ${colors.border.success} ${borders.width.default} ${colors.text.primary} ${shadows.sm}`,
    error: `bg-red-50 border-red-200 border text-red-900 ${shadows.sm}`,
    ghost: `bg-transparent border-0 ${colors.text.primary}`
  };

  const paddings = {
    none: '',
    sm: spacing.padding.small,
    md: spacing.padding.medium,
    lg: spacing.padding.large
  };

  return (
    <div 
      className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

