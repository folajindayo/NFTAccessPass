import React from 'react';

import { colors, typography } from '@/theme';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Standardized Heading component using the design system.
 */
export const Heading: React.FC<HeadingProps> = ({ 
  children, 
  className = '', 
  level = 1,
  ...props 
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const styles = {
    1: `${typography.h1} font-extrabold tracking-tight`,
    2: `${typography.h2} font-bold tracking-tight`,
    3: `${typography.h3} font-bold`,
    4: 'text-xl font-semibold',
    5: 'text-lg font-semibold',
    6: 'text-base font-semibold uppercase tracking-wide'
  };

  return (
    <Tag className={`${styles[level]} ${colors.text.primary} ${className}`} {...props}>
      {children}
    </Tag>
  );
};


