import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success';
}

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

