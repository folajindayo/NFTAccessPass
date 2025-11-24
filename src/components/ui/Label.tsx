import React from 'react';
import { colors, typography, spacing } from '@/theme';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({ children, className = '', ...props }) => {
  return (
    <label 
      className={`${typography.small} ${typography.weight.semibold} ${colors.text.secondary} ${spacing.margin.bottom} block ${className}`} 
      {...props}
    >
      {children}
    </label>
  );
};
