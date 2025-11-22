import React from 'react';

/**
 * Props for the Card component.
 */
interface CardProps {
  /** Content to display inside the card. */
  children: React.ReactNode;
  /** Additional CSS classes. */
  className?: string;
  /** Visual style variant of the card. */
  variant?: 'default' | 'success';
}

/**
 * A container component for grouping content.
 * 
 * @param props - CardProps
 * @returns A styled div element.
 */
export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  variant = 'default'
}) => {
  const baseStyles = "p-6 rounded-xl border flex flex-col items-center gap-4";
  const variants = {
    default: "bg-gray-800 border-gray-700 text-white",
    success: "bg-green-800 border-green-600 text-white"
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};
