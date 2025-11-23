import React from 'react';
import { colors } from '@/theme';

interface DividerProps {
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ className = '' }) => {
  return <hr className={`${colors.border.default} border-t ${className}`} />;
};

