import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast, ToastProvider, useToast } from '@/components/ui/Toast';

// Test component that uses the toast hook
function ToastTrigger() {
  const toast = useToast();
  
  return (
    <div>
      <button onClick={() => toast.success('Success message')}>
        Show Success
      </button>
      <button onClick={() => toast.error('Error message')}>
        Show Error
      </button>
      <button onClick={() => toast.warning('Warning message')}>
        Show Warning
      </button>
      <button onClick={() => toast.info('Info message')}>
        Show Info
      </button>
    </div>
  );
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders toast message', () => {
    render(
      <Toast
        message="Test message"
        type="info"
        isVisible={true}
        onClose={() => {}}
      />
    );
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders with different types', () => {
    const { rerender } = render(
      <Toast message="Message" type="success" isVisible={true} onClose={() => {}} />
    );
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50');

    rerender(<Toast message="Message" type="error" isVisible={true} onClose={() => {}} />);
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50');

    rerender(<Toast message="Message" type="warning" isVisible={true} onClose={() => {}} />);
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50');

    rerender(<Toast message="Message" type="info" isVisible={true} onClose={() => {}} />);
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-50');
  });

  it('calls onClose when dismiss button is clicked', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(
      <Toast message="Message" type="info" isVisible={true} onClose={onClose} />
    );
    
    await user.click(screen.getByRole('button', { name: /close/i }));
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('auto-closes after duration', async () => {
    const onClose = vi.fn();
    
    render(
      <Toast
        message="Message"
        type="info"
        isVisible={true}
        onClose={onClose}
        duration={3000}
      />
    );
    
    expect(onClose).not.toHaveBeenCalled();
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not auto-close when duration is 0', () => {
    const onClose = vi.fn();
    
    render(
      <Toast
        message="Message"
        type="info"
        isVisible={true}
        onClose={onClose}
        duration={0}
      />
    );
    
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not render when isVisible is false', () => {
    render(
      <Toast message="Message" type="info" isVisible={false} onClose={() => {}} />
    );
    
    expect(screen.queryByText('Message')).not.toBeInTheDocument();
  });

  it('renders with title', () => {
    render(
      <Toast
        message="Message content"
        title="Title"
        type="info"
        isVisible={true}
        onClose={() => {}}
      />
    );
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Message content')).toBeInTheDocument();
  });

  it('renders appropriate icon for each type', () => {
    const { container, rerender } = render(
      <Toast message="Message" type="success" isVisible={true} onClose={() => {}} />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();

    rerender(<Toast message="Message" type="error" isVisible={true} onClose={() => {}} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('provides toast context', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );
    
    expect(screen.getByText('Show Success')).toBeInTheDocument();
  });

  it('shows success toast', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );
    
    await user.click(screen.getByText('Show Success'));
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });
  });

  it('shows error toast', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );
    
    await user.click(screen.getByText('Show Error'));
    
    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  it('renders multiple toasts', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );
    
    await user.click(screen.getByText('Show Success'));
    await user.click(screen.getByText('Show Error'));
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });
});

