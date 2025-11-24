import React from 'react';
import { colors, spacing, borders, typography } from '@/theme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  error?: boolean;
}

export const Input: React.FC<InputProps> = ({ 
  className = '', 
  error = false,
  ...props 
}) => {
  const baseStyles = `${spacing.input} ${borders.radius.lg} ${borders.width.default} w-full ${colors.background} ${colors.text.primary} focus:outline-none focus:ring-2`;
  const borderClass = error ? 'border-red-500 focus:ring-red-500' : `${colors.border.default} focus:ring-blue-500`;

  return (
    <input
      className={`${baseStyles} ${borderClass} ${className}`}
      {...props}
    />
  );
};
