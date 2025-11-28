import React from 'react';

/**
 * Badge variant types
 */
type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

/**
 * Badge size types
 */
type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Badge component
 */
interface BadgeProps {
  /** The content to display inside the badge */
  children: React.ReactNode;
  /** The visual style variant of the badge */
  variant?: BadgeVariant;
  /** The size of the badge */
  size?: BadgeSize;
  /** Whether to render as a pill shape (fully rounded) */
  pill?: boolean;
  /** Optional icon to display before the text */
  icon?: React.ReactNode;
  /** Whether the badge can be dismissed */
  dismissible?: boolean;
  /** Callback when dismiss button is clicked */
  onDismiss?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Variant style classes
 */
const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  secondary: 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
};

/**
 * Size style classes
 */
const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

/**
 * Dismiss button component
 */
const DismissButton: React.FC<{ onClick: () => void; size: BadgeSize }> = ({ onClick, size }) => {
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  
  return (
    <button
      type="button"
      onClick={onClick}
      className="ml-1 -mr-0.5 inline-flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none"
      aria-label="Dismiss"
    >
      <svg 
        className={iconSize} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M6 18L18 6M6 6l12 12" 
        />
      </svg>
    </button>
  );
};

/**
 * A badge component for displaying status, labels, or counts.
 * Supports multiple variants, sizes, and optional dismiss functionality.
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  pill = false,
  icon,
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  const baseClasses = [
    'inline-flex items-center font-medium',
    pill ? 'rounded-full' : 'rounded-md',
  ].join(' ');

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {icon && <span className="mr-1 flex-shrink-0">{icon}</span>}
      {children}
      {dismissible && onDismiss && (
        <DismissButton onClick={onDismiss} size={size} />
      )}
    </span>
  );
};

/**
 * Dot badge for status indicators
 */
export const DotBadge: React.FC<{
  color?: 'gray' | 'green' | 'yellow' | 'red' | 'blue';
  label?: string;
  className?: string;
}> = ({ color = 'gray', label, className = '' }) => {
  const dotColors: Record<string, string> = {
    gray: 'bg-gray-400',
    green: 'bg-green-400',
    yellow: 'bg-yellow-400',
    red: 'bg-red-400',
    blue: 'bg-blue-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`h-2 w-2 rounded-full ${dotColors[color]}`} />
      {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
    </span>
  );
};

/**
 * Counter badge for notifications
 */
export const CounterBadge: React.FC<{
  count: number;
  max?: number;
  variant?: BadgeVariant;
  className?: string;
}> = ({ count, max = 99, variant = 'danger', className = '' }) => {
  const displayCount = count > max ? `${max}+` : count.toString();
  
  if (count === 0) return null;
  
  return (
    <Badge 
      variant={variant} 
      size="sm" 
      pill 
      className={`min-w-[1.25rem] justify-center ${className}`}
    >
      {displayCount}
    </Badge>
  );
};

export default Badge;

