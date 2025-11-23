import React from 'react';

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

export const Flex: React.FC<FlexProps> = ({ 
  children, 
  className = '', 
  direction = 'row',
  align = 'stretch',
  justify = 'start',
  ...props 
}) => {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  };

  return (
    <div 
      className={`flex ${directionClasses[direction]} ${alignClasses[align]} ${justifyClasses[justify]} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

