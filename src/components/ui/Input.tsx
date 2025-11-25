import React from 'react';

import { colors, spacing, borders, typography } from '@/theme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  hasError?: boolean;
}

export const Input: React.FC<InputProps> = ({ 
  className = '', 
  hasError = false,
  ...props 
}) => {
  const baseStyles = `${spacing.input} ${borders.radius.lg} ${borders.width.default} bg-gray-800 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`;
  const borderStyle = hasError ? 'border-red-500 focus:ring-red-500' : colors.border.default;

  return (
    <input 
      className={`${baseStyles} ${borderStyle} ${className}`} 
      {...props} 
    />
  );
};
