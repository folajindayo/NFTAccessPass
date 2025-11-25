import React from 'react';

import { colors } from '@/theme';

interface DividerProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  color?: string;
}

/**
 * A flexible Divider component.
 */
export const Divider: React.FC<DividerProps> = ({ 
  className = '', 
  orientation = 'horizontal',
  color = colors.border.default
}) => {
  const baseStyle = orientation === 'horizontal' 
    ? `w-full border-t ${color}` 
    : `h-full border-l ${color}`;

  return <hr className={`${baseStyle} ${className}`} aria-orientation={orientation} />;
};


