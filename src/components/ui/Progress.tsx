import React from 'react';

/**
 * Progress bar size types
 */
type ProgressSize = 'sm' | 'md' | 'lg';

/**
 * Progress bar variant types
 */
type ProgressVariant = 'default' | 'success' | 'warning' | 'danger';

/**
 * Props for the Progress component
 */
interface ProgressProps {
  /** Current value (0-100) */
  value: number;
  /** Maximum value */
  max?: number;
  /** Size of the progress bar */
  size?: ProgressSize;
  /** Color variant */
  variant?: ProgressVariant;
  /** Whether to show the percentage label */
  showLabel?: boolean;
  /** Custom label */
  label?: string;
  /** Whether to animate the progress bar */
  animated?: boolean;
  /** Whether to show stripes */
  striped?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Size classes
 */
const sizeClasses: Record<ProgressSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-4',
};

/**
 * Variant color classes
 */
const variantClasses: Record<ProgressVariant, string> = {
  default: 'bg-blue-600',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
};

/**
 * A progress bar component for displaying completion or loading states.
 */
export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  animated = false,
  striped = false,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const displayLabel = label ?? `${Math.round(percentage)}%`;

  const barClasses = [
    variantClasses[variant],
    'transition-all duration-300 ease-out',
    animated ? 'animate-pulse' : '',
    striped ? 'bg-stripes' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {displayLabel}
          </span>
        </div>
      )}
      
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={displayLabel}
        className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}
      >
        <div
          className={`h-full rounded-full ${barClasses}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Circular progress indicator
 */
export const CircularProgress: React.FC<{
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: ProgressVariant;
  showLabel?: boolean;
  className?: string;
}> = ({
  value,
  max = 100,
  size = 48,
  strokeWidth = 4,
  variant = 'default',
  showLabel = true,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const strokeColors: Record<ProgressVariant, string> = {
    default: 'stroke-blue-600',
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    danger: 'stroke-red-500',
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`transition-all duration-300 ease-out ${strokeColors[variant]}`}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-semibold text-gray-700 dark:text-gray-300">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

/**
 * Indeterminate loading bar
 */
export const LoadingBar: React.FC<{
  variant?: ProgressVariant;
  className?: string;
}> = ({ variant = 'default', className = '' }) => (
  <div className={`w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${className}`}>
    <div 
      className={`h-full ${variantClasses[variant]} animate-loading-bar`}
      style={{
        animation: 'loading-bar 1.5s ease-in-out infinite',
      }}
    />
  </div>
);

export default Progress;

