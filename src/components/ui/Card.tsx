import React from 'react';
import { colors, spacing, borders } from '@/theme';

/**
 * Props for the Card component.
 */
interface CardProps {
  /** Content to display inside the card. */
  children: React.ReactNode;
  /** Additional CSS classes. */
  className?: string;
  /** Visual style variant of the card. */
  variant?: 'default' | 'success';
}

/**
 * A container component for grouping content.
 * 
 * @param props - CardProps
 * @returns A styled div element.
 */
export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  variant = 'default'
}) => {
  const baseStyles = `${spacing.card} ${borders.radius.xl} ${borders.width.default} flex flex-col items-center ${spacing.gap.small}`;
  const variants = {
    default: `${colors.surface} ${colors.border.default} ${colors.text.primary}`,
    success: `${colors.surfaceSuccess} ${colors.border.success} ${colors.text.primary}`
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};
