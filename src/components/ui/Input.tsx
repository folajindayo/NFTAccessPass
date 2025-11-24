import React from 'react';
import { colors, spacing, borders, typography } from '@/theme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    const baseStyles = `${spacing.input} ${borders.radius.lg} ${borders.width.default} w-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`;
    const borderStyle = error ? 'border-red-500' : colors.border.default;

    return (
      <input
        ref={ref}
        className={`${baseStyles} ${borderStyle} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
