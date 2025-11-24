import React from 'react';
import { colors, spacing, borders, typography } from '@/theme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  className = '', 
  id,
  ...props 
}) => {
  const inputId = id || props.name || Math.random().toString(36).substring(7);
  
  return (
    <div className={`flex flex-col ${spacing.gap.small} w-full`}>
      {label && (
        <label htmlFor={inputId} className={`${typography.small} ${colors.text.secondary} ${typography.weight.semibold}`}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          ${spacing.input} 
          ${borders.radius.lg} 
          ${borders.width.default} 
          ${colors.surface} 
          ${colors.border.default} 
          ${colors.text.primary}
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className={`${typography.small} text-red-500`}>{error}</span>
      )}
    </div>
  );
};

