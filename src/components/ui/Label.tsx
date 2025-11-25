import React from 'react';

import { typography, colors } from '@/theme';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

export const Label: React.FC<LabelProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <label 
      className={`${typography.small} ${colors.text.secondary} font-medium mb-1 block ${className}`} 
      {...props}
    >
      {children}
    </label>
  );
};
