import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from '@/components/ui/Spinner';

describe('Spinner', () => {
  it('renders with default props', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with accessible label', () => {
    render(<Spinner label="Loading data" />);
    expect(screen.getByText('Loading data')).toBeInTheDocument();
  });

  it('renders default sr-only label', () => {
    render(<Spinner />);
    expect(screen.getByText('Loading...')).toHaveClass('sr-only');
  });

  it('renders with different sizes', () => {
    const { rerender, container } = render(<Spinner size="xs" />);
    expect(container.querySelector('svg')).toHaveClass('w-3', 'h-3');

    rerender(<Spinner size="sm" />);
    expect(container.querySelector('svg')).toHaveClass('w-4', 'h-4');

    rerender(<Spinner size="md" />);
    expect(container.querySelector('svg')).toHaveClass('w-6', 'h-6');

    rerender(<Spinner size="lg" />);
    expect(container.querySelector('svg')).toHaveClass('w-8', 'h-8');

    rerender(<Spinner size="xl" />);
    expect(container.querySelector('svg')).toHaveClass('w-12', 'h-12');
  });

  it('renders with different variants', () => {
    const { rerender, container } = render(<Spinner variant="primary" />);
    expect(container.querySelector('svg')).toHaveClass('text-indigo-600');

    rerender(<Spinner variant="secondary" />);
    expect(container.querySelector('svg')).toHaveClass('text-gray-600');

    rerender(<Spinner variant="white" />);
    expect(container.querySelector('svg')).toHaveClass('text-white');
  });

  it('applies animation class', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toHaveClass('animate-spin');
  });

  it('applies custom className', () => {
    const { container } = render(<Spinner className="custom-spinner" />);
    expect(container.firstChild).toHaveClass('custom-spinner');
  });

  it('shows visible label when showLabel is true', () => {
    render(<Spinner label="Loading..." showLabel />);
    const label = screen.getByText('Loading...');
    expect(label).not.toHaveClass('sr-only');
    expect(label).toBeVisible();
  });

  it('has correct aria attributes', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-live', 'polite');
  });

  it('renders SVG with correct structure', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.querySelector('circle')).toBeInTheDocument();
    expect(svg?.querySelector('path')).toBeInTheDocument();
  });
});

