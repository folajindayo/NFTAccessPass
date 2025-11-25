import React from 'react';

import { spacing } from '@/theme';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'small' | 'medium' | 'large' | 'xl';
}

/**
 * Standardized CSS Grid container.
 */
export const Grid: React.FC<GridProps> = ({ 
  children, 
  className = '', 
  cols = 1,
  gap = 'medium',
  ...props 
}) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
    12: 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-12'
  };

  const gapClasses = {
    small: spacing.gap.small,
    medium: spacing.gap.medium,
    large: spacing.gap.large,
    xl: 'gap-10'
  };

  return (
    <div className={`grid ${colClasses[cols]} ${gapClasses[gap]} ${className}`} {...props}>
      {children}
    </div>
  );
};


