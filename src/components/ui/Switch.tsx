import React from 'react';

/**
 * Switch size types
 */
type SwitchSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Switch component
 */
interface SwitchProps {
  /** Whether the switch is checked */
  checked: boolean;
  /** Callback when the switch state changes */
  onChange: (checked: boolean) => void;
  /** Size of the switch */
  size?: SwitchSize;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Label for the switch */
  label?: string;
  /** Description text below the label */
  description?: string;
  /** ID for the switch input */
  id?: string;
  /** Name for the switch input */
  name?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Size classes for the switch
 */
const sizeClasses: Record<SwitchSize, {
  track: string;
  thumb: string;
  translate: string;
}> = {
  sm: {
    track: 'h-4 w-7',
    thumb: 'h-3 w-3',
    translate: 'translate-x-3',
  },
  md: {
    track: 'h-6 w-11',
    thumb: 'h-5 w-5',
    translate: 'translate-x-5',
  },
  lg: {
    track: 'h-8 w-14',
    thumb: 'h-7 w-7',
    translate: 'translate-x-6',
  },
};

/**
 * A toggle switch component for binary choices.
 */
export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  size = 'md',
  disabled = false,
  label,
  description,
  id,
  name,
  className = '',
}) => {
  const sizes = sizeClasses[size];
  const switchId = id || `switch-${Math.random().toString(36).slice(2, 9)}`;

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className={`flex items-start ${className}`}>
      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        aria-disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative inline-flex flex-shrink-0 cursor-pointer rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${sizes.track}
          ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={() => {}}
          className="sr-only"
          tabIndex={-1}
        />
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block rounded-full
            bg-white shadow-sm ring-0
            transform transition duration-200 ease-in-out
            ${sizes.thumb}
            ${checked ? sizes.translate : 'translate-x-0.5'}
          `}
        />
      </button>
      
      {(label || description) && (
        <div className="ml-3">
          {label && (
            <label
              htmlFor={switchId}
              className={`text-sm font-medium cursor-pointer ${
                disabled 
                  ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Switch group for multiple related switches
 */
export const SwitchGroup: React.FC<{
  label?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, children, className = '' }) => (
  <fieldset className={className}>
    {label && (
      <legend className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        {label}
      </legend>
    )}
    <div className="space-y-4">
      {children}
    </div>
  </fieldset>
);

export default Switch;

