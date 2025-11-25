import React from 'react';

import { colors, typography } from '@/theme';

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'body' | 'small' | 'muted' | 'label' | 'error';
}

/**
 * Standardized Text component for consistent typography.
 */
export const Text: React.FC<TextProps> = ({ 
  children, 
  className = '', 
  variant = 'body',
  ...props 
}) => {
  const styles = {
    body: `${typography.body} ${colors.text.primary}`,
    small: `${typography.small} ${colors.text.secondary}`,
    muted: `${typography.small} ${colors.text.muted}`,
    label: `text-sm font-medium ${colors.text.primary}`,
    error: `text-sm ${colors.status.error}`
  };

  return (
    <p className={`${styles[variant]} ${className}`} {...props}>
      {children}
    </p>
  );
};


