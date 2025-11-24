import React from 'react';
import { colors, typography, spacing } from '@/theme';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ 
  children, 
  className = '', 
  required,
  ...props 
}) => {
  return (
    <label 
      className={`block ${typography.small} ${colors.text.secondary} ${spacing.margin.bottom} ${className}`} 
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};
