import React from 'react';
import { colors, spacing, borders, typography } from '@/theme';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * Props for the Button component.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The visual style variant of the button. */
  variant?: 'primary' | 'secondary';
  /** Whether the button is in a loading state. */
  isLoading?: boolean;
}

/**
 * A reusable button component with loading state and variants.
 * 
 * @param props - ButtonProps
 * @returns A styled button element.
 */
export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '',
  disabled,
  ...props 
}) => {
  const { t } = useTranslation();
  
  const baseStyles = `${spacing.input} ${borders.radius.lg} ${typography.weight.semibold} transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`;
  const variants = {
    primary: `${colors.primary} hover:bg-blue-700 text-white`,
    secondary: `${colors.secondary} hover:bg-gray-100 text-gray-800 border border-gray-300`
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {t('common.loading')}
        </span>
      ) : children}
    </button>
  );
};

