import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from '@/components/ui/Alert';

describe('Alert', () => {
  it('renders with default props', () => {
    render(<Alert>Alert message</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<Alert title="Alert Title">Alert content</Alert>);
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
    expect(screen.getByText('Alert content')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Alert variant="info">Info</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-50');

    rerender(<Alert variant="success">Success</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50');

    rerender(<Alert variant="warning">Warning</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50');

    rerender(<Alert variant="error">Error</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50');
  });

  it('renders default icon based on variant', () => {
    const { rerender, container } = render(<Alert variant="info">Info</Alert>);
    expect(container.querySelector('svg')).toBeInTheDocument();

    rerender(<Alert variant="success">Success</Alert>);
    expect(container.querySelector('svg')).toBeInTheDocument();

    rerender(<Alert variant="warning">Warning</Alert>);
    expect(container.querySelector('svg')).toBeInTheDocument();

    rerender(<Alert variant="error">Error</Alert>);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders custom icon', () => {
    const CustomIcon = () => <span data-testid="custom-icon">★</span>;
    render(<Alert icon={<CustomIcon />}>Custom icon alert</Alert>);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders as dismissible and calls onDismiss', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    
    render(
      <Alert dismissible onDismiss={onDismiss}>
        Dismissible alert
      </Alert>
    );
    
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    await user.click(dismissButton);
    
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not render dismiss button when not dismissible', () => {
    render(<Alert>Not dismissible</Alert>);
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Alert className="custom-alert">Custom</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('custom-alert');
  });

  it('renders children as React nodes', () => {
    render(
      <Alert>
        <p data-testid="paragraph">Paragraph content</p>
        <a href="#">Link</a>
      </Alert>
    );
    
    expect(screen.getByTestId('paragraph')).toBeInTheDocument();
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('has correct border color for each variant', () => {
    const { rerender } = render(<Alert variant="info">Info</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('border-blue-200');

    rerender(<Alert variant="success">Success</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('border-green-200');

    rerender(<Alert variant="warning">Warning</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('border-yellow-200');

    rerender(<Alert variant="error">Error</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('border-red-200');
  });

  it('has correct text color for each variant', () => {
    const { rerender } = render(<Alert variant="info">Info</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('text-blue-800');

    rerender(<Alert variant="success">Success</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('text-green-800');

    rerender(<Alert variant="warning">Warning</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('text-yellow-800');

    rerender(<Alert variant="error">Error</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('text-red-800');
  });
});

