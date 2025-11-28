import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/ui/Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<Modal {...defaultProps} title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders with footer', () => {
    render(
      <Modal {...defaultProps} footer={<button>Save</button>}>
        Content
      </Modal>
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<Modal {...defaultProps} showCloseButton />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(<Modal {...defaultProps} closeOnBackdrop />);
    
    const backdrop = screen.getByTestId('modal-backdrop');
    await user.click(backdrop);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when backdrop click is disabled', async () => {
    const user = userEvent.setup();
    render(<Modal {...defaultProps} closeOnBackdrop={false} />);
    
    const backdrop = screen.getByTestId('modal-backdrop');
    await user.click(backdrop);
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    render(<Modal {...defaultProps} closeOnEscape />);
    
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when Escape is disabled', () => {
    render(<Modal {...defaultProps} closeOnEscape={false} />);
    
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Modal {...defaultProps} size="sm" />);
    const modalContent = screen.getByRole('dialog');
    expect(modalContent).toHaveClass('max-w-sm');

    rerender(<Modal {...defaultProps} size="md" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-md');

    rerender(<Modal {...defaultProps} size="lg" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-lg');

    rerender(<Modal {...defaultProps} size="xl" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-xl');

    rerender(<Modal {...defaultProps} size="full" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-full');
  });

  it('applies custom className to modal', () => {
    render(<Modal {...defaultProps} className="custom-modal" />);
    expect(screen.getByRole('dialog')).toHaveClass('custom-modal');
  });

  it('does not render close button when showCloseButton is false', () => {
    render(<Modal {...defaultProps} showCloseButton={false} />);
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('has correct aria attributes', () => {
    render(<Modal {...defaultProps} title="Accessible Modal" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });
});

