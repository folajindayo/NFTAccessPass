import React, { useEffect, useCallback } from 'react';

/**
 * Modal size types
 */
type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Props for the Modal component
 */
interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when the modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Modal size */
  size?: ModalSize;
  /** Whether clicking the backdrop closes the modal */
  closeOnBackdrop?: boolean;
  /** Whether pressing Escape closes the modal */
  closeOnEscape?: boolean;
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Footer content */
  footer?: React.ReactNode;
  /** Additional CSS classes for the modal */
  className?: string;
}

/**
 * Size classes for the modal
 */
const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
};

/**
 * Close button component
 */
const CloseButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
    aria-label="Close modal"
  >
    <svg 
      className="h-5 w-5" 
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

/**
 * Modal backdrop component
 */
const Backdrop: React.FC<{
  onClick?: () => void;
  isVisible: boolean;
}> = ({ onClick, isVisible }) => (
  <div
    className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}
    onClick={onClick}
    aria-hidden="true"
  />
);

/**
 * A modal dialog component with backdrop, animations, and accessibility features.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  footer,
  className = '',
}) => {
  // Handle escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (closeOnEscape && e.key === 'Escape') {
      onClose();
    }
  }, [closeOnEscape, onClose]);

  // Add/remove escape listener and manage body scroll
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  // Don't render if not open
  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <Backdrop onClick={handleBackdropClick} isVisible={isOpen} />
      
      <div
        className={`relative w-full ${sizeClasses[size]} transform transition-all duration-200 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={handleContentClick}
      >
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl ${className}`}>
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="relative px-6 pt-6 pb-0">
              {title && (
                <h2 
                  id="modal-title"
                  className="text-xl font-semibold text-gray-900 dark:text-white pr-8"
                >
                  {title}
                </h2>
              )}
              {showCloseButton && <CloseButton onClick={onClose} />}
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl border-t border-gray-200 dark:border-gray-700">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Modal header component for custom headers
 */
export const ModalHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`px-6 pt-6 pb-2 ${className}`}>
    {children}
  </div>
);

/**
 * Modal body component
 */
export const ModalBody: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

/**
 * Modal footer component
 */
export const ModalFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 ${className}`}>
    {children}
  </div>
);

export default Modal;

