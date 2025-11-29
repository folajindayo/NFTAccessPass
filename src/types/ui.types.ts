/**
 * UI component-related type definitions
 */

import type { ReactNode, ComponentPropsWithoutRef } from 'react';

/**
 * Size variants
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Color variants
 */
export type ColorVariant = 
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

/**
 * Button variant
 */
export type ButtonVariant = 
  | 'solid'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'soft';

/**
 * Position
 */
export type Position = 
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center';

/**
 * Alignment
 */
export type Alignment = 'start' | 'center' | 'end' | 'stretch';

/**
 * Justify
 */
export type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

/**
 * Base component props
 */
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  testId?: string;
}

/**
 * Button props
 */
export interface ButtonProps extends BaseComponentProps, ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant;
  color?: ColorVariant;
  size?: Size;
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

/**
 * Card props
 */
export interface CardProps extends BaseComponentProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: Size;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

/**
 * Input props
 */
export interface InputProps extends BaseComponentProps, ComponentPropsWithoutRef<'input'> {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  size?: Size;
  isInvalid?: boolean;
}

/**
 * Modal props
 */
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: Size | 'full';
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  footer?: ReactNode;
}

/**
 * Toast props
 */
export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  isClosable?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Tooltip props
 */
export interface TooltipProps extends BaseComponentProps {
  content: ReactNode;
  position?: Position;
  delay?: number;
  disabled?: boolean;
  trigger?: 'hover' | 'click' | 'focus';
}

/**
 * Badge props
 */
export interface BadgeProps extends BaseComponentProps {
  variant?: 'solid' | 'outline' | 'soft';
  color?: ColorVariant;
  size?: Size;
  rounded?: boolean;
}

/**
 * Avatar props
 */
export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: Size;
  shape?: 'circle' | 'square';
  fallback?: ReactNode;
}

/**
 * Skeleton props
 */
export interface SkeletonProps extends BaseComponentProps {
  width?: string | number;
  height?: string | number;
  rounded?: boolean | Size;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Spinner props
 */
export interface SpinnerProps extends BaseComponentProps {
  size?: Size;
  color?: ColorVariant;
  thickness?: number;
}

/**
 * Dropdown item
 */
export interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

/**
 * Dropdown props
 */
export interface DropdownProps extends BaseComponentProps {
  items: DropdownItem[];
  trigger: ReactNode;
  position?: Position;
  closeOnSelect?: boolean;
}

/**
 * Tab item
 */
export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  content?: ReactNode;
}

/**
 * Tabs props
 */
export interface TabsProps extends BaseComponentProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Progress props
 */
export interface ProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  color?: ColorVariant;
  size?: Size;
  showLabel?: boolean;
  animated?: boolean;
}

/**
 * Alert props
 */
export interface AlertProps extends BaseComponentProps {
  status: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  description?: string;
  icon?: ReactNode;
  isClosable?: boolean;
  onClose?: () => void;
}

/**
 * Table column
 */
export interface TableColumn<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

/**
 * Table props
 */
export interface TableProps<T> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string) => void;
}

/**
 * Pagination props
 */
export interface PaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
}

