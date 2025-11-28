import React, { useState, useRef, useEffect } from 'react';

/**
 * Tooltip position types
 */
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Props for the Tooltip component
 */
interface TooltipProps {
  /** The content to display in the tooltip */
  content: React.ReactNode;
  /** The element that triggers the tooltip */
  children: React.ReactNode;
  /** Position of the tooltip relative to the trigger */
  position?: TooltipPosition;
  /** Delay before showing the tooltip (ms) */
  delay?: number;
  /** Whether the tooltip is disabled */
  disabled?: boolean;
  /** Additional CSS classes for the tooltip */
  className?: string;
}

/**
 * Position classes for the tooltip
 */
const positionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

/**
 * Arrow position classes
 */
const arrowClasses: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700 border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700 border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700 border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700 border-y-transparent border-l-transparent',
};

/**
 * A tooltip component for displaying additional information on hover.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  disabled = false,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 ${positionClasses[position]} ${className}`}
        >
          <div className="px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg whitespace-nowrap">
            {content}
          </div>
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

/**
 * Simple tooltip wrapper for text content
 */
export const TooltipText: React.FC<{
  text: string;
  children: React.ReactNode;
  position?: TooltipPosition;
}> = ({ text, children, position = 'top' }) => (
  <Tooltip content={text} position={position}>
    {children}
  </Tooltip>
);

/**
 * Info tooltip with question mark icon
 */
export const InfoTooltip: React.FC<{
  content: React.ReactNode;
  position?: TooltipPosition;
  className?: string;
}> = ({ content, position = 'top', className = '' }) => (
  <Tooltip content={content} position={position}>
    <button
      type="button"
      className={`inline-flex items-center justify-center h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors ${className}`}
      aria-label="More information"
    >
      ?
    </button>
  </Tooltip>
);

export default Tooltip;

