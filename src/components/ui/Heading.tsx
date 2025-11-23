import React from 'react';
import { colors, typography } from '@/theme';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3;
}

export const Heading: React.FC<HeadingProps> = ({ 
  children, 
  className = '', 
  level = 1,
  ...props 
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const styles = {
    1: typography.h1,
    2: typography.h2,
    3: typography.h3
  };

  return (
    <Tag className={`${styles[level]} ${colors.text.primary} ${className}`} {...props}>
      {children}
    </Tag>
  );
};

