import React, { forwardRef } from 'react';

/**
 * Props for the Textarea component
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label for the textarea */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Whether to show character count */
  showCount?: boolean;
  /** Whether to auto-resize based on content */
  autoResize?: boolean;
}

/**
 * A textarea component with label, error state, and character count.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  showCount = false,
  autoResize = false,
  className = '',
  maxLength,
  value,
  onChange,
  disabled,
  required,
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
  const currentLength = typeof value === 'string' ? value.length : 0;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
    onChange?.(e);
  };

  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
        className={`
          block w-full rounded-lg px-4 py-3
          border transition-colors duration-200
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
          }
          ${disabled 
            ? 'bg-gray-100 dark:bg-gray-800' 
            : 'bg-white dark:bg-gray-900'
          }
          text-gray-900 dark:text-white
          ${autoResize ? 'resize-none overflow-hidden' : 'resize-y'}
        `}
        {...props}
      />

      <div className="flex justify-between items-center mt-1">
        <div>
          {error && (
            <p id={`${textareaId}-error`} className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          {helperText && !error && (
            <p id={`${textareaId}-helper`} className="text-sm text-gray-500 dark:text-gray-400">
              {helperText}
            </p>
          )}
        </div>
        
        {showCount && maxLength && (
          <span className={`text-sm ${
            currentLength >= maxLength 
              ? 'text-red-500' 
              : currentLength >= maxLength * 0.9 
                ? 'text-yellow-500' 
                : 'text-gray-400'
          }`}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;

