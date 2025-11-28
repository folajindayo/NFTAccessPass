import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from '@/components/ui/Progress';

describe('Progress', () => {
  it('renders with default props', () => {
    render(<Progress value={50} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
  });

  it('renders with custom value', () => {
    render(<Progress value={75} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '75');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders with custom max value', () => {
    render(<Progress value={50} max={200} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuemax', '200');
  });

  it('renders with label', () => {
    render(<Progress value={50} label="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with percentage label', () => {
    render(<Progress value={75} showPercentage />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender, container } = render(<Progress value={50} size="xs" />);
    expect(container.querySelector('.h-1')).toBeInTheDocument();

    rerender(<Progress value={50} size="sm" />);
    expect(container.querySelector('.h-2')).toBeInTheDocument();

    rerender(<Progress value={50} size="md" />);
    expect(container.querySelector('.h-3')).toBeInTheDocument();

    rerender(<Progress value={50} size="lg" />);
    expect(container.querySelector('.h-4')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender, container } = render(<Progress value={50} variant="primary" />);
    expect(container.querySelector('.bg-indigo-600')).toBeInTheDocument();

    rerender(<Progress value={50} variant="success" />);
    expect(container.querySelector('.bg-green-600')).toBeInTheDocument();

    rerender(<Progress value={50} variant="warning" />);
    expect(container.querySelector('.bg-yellow-600')).toBeInTheDocument();

    rerender(<Progress value={50} variant="error" />);
    expect(container.querySelector('.bg-red-600')).toBeInTheDocument();
  });

  it('clamps value between 0 and max', () => {
    const { rerender } = render(<Progress value={-10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');

    rerender(<Progress value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('renders with animation', () => {
    const { container } = render(<Progress value={50} animated />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders with stripes', () => {
    const { container } = render(<Progress value={50} striped />);
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Progress value={50} className="custom-progress" />);
    expect(container.firstChild).toHaveClass('custom-progress');
  });

  it('calculates correct width percentage', () => {
    const { container } = render(<Progress value={25} />);
    const progressFill = container.querySelector('[style*="width"]');
    expect(progressFill).toHaveStyle({ width: '25%' });
  });

  it('renders 0% correctly', () => {
    const { container } = render(<Progress value={0} showPercentage />);
    expect(screen.getByText('0%')).toBeInTheDocument();
    const progressFill = container.querySelector('[style*="width"]');
    expect(progressFill).toHaveStyle({ width: '0%' });
  });

  it('renders 100% correctly', () => {
    const { container } = render(<Progress value={100} showPercentage />);
    expect(screen.getByText('100%')).toBeInTheDocument();
    const progressFill = container.querySelector('[style*="width"]');
    expect(progressFill).toHaveStyle({ width: '100%' });
  });
});

