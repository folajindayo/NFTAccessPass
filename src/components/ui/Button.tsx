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
  
  const baseStyles = `${spacing.input} ${borders.radius.lg} ${typography.weight.semibold} transition-colors disabled:opacity-50`;
  const variants = {
    primary: colors.primary,
    secondary: colors.secondary
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? t('common.loading') : children}
    </button>
  );
};
