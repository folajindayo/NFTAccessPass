import React from 'react';

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
  const baseStyles = "px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white",
    secondary: "bg-gray-600 hover:bg-gray-500 text-white"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
