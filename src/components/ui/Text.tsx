import React from 'react';
import { colors, typography } from '@/theme';

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'body' | 'small' | 'muted';
}

export const Text: React.FC<TextProps> = ({ 
  children, 
  className = '', 
  variant = 'body',
  ...props 
}) => {
  const styles = {
    body: `${typography.body} ${colors.text.primary}`,
    small: `${typography.small} ${colors.text.secondary}`,
    muted: `${typography.small} ${colors.text.muted}`
  };

  return (
    <p className={`${styles[variant]} ${className}`} {...props}>
      {children}
    </p>
  );
};

