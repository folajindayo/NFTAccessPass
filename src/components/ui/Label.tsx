import React from 'react';
import { colors, typography } from '@/theme';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ 
  children, 
  required = false, 
  className = '',
  ...props 
}) => {
  return (
    <label 
      className={`${typography.small} ${colors.text.secondary} ${typography.weight.semibold} ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

