import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from '@/components/ui/Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders children', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows tooltip on hover', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    
    render(
      <Tooltip content="Tooltip content" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    await user.hover(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    });
  });

  it('hides tooltip on mouse leave', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    
    render(
      <Tooltip content="Tooltip content" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    const button = screen.getByRole('button');
    await user.hover(button);
    
    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    });
    
    await user.unhover(button);
    
    await waitFor(() => {
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    });
  });

  it('renders with different positions', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    
    const { rerender } = render(
      <Tooltip content="Tooltip" position="top" delay={0}>
        <button>Button</button>
      </Tooltip>
    );
    
    await user.hover(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Tooltip')).toHaveClass('bottom-full');
    });

    rerender(
      <Tooltip content="Tooltip" position="bottom" delay={0}>
        <button>Button</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Tooltip')).toHaveClass('top-full');
    });

    rerender(
      <Tooltip content="Tooltip" position="left" delay={0}>
        <button>Button</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Tooltip')).toHaveClass('right-full');
    });

    rerender(
      <Tooltip content="Tooltip" position="right" delay={0}>
        <button>Button</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Tooltip')).toHaveClass('left-full');
    });
  });

  it('does not show tooltip when disabled', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    
    render(
      <Tooltip content="Tooltip content" disabled delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    await user.hover(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    }, { timeout: 100 });
  });

  it('respects custom delay', async () => {
    vi.useFakeTimers();
    
    render(
      <Tooltip content="Tooltip content" delay={500}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByRole('button'));
    
    // Tooltip should not be visible immediately
    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    
    // Advance timer past delay
    vi.advanceTimersByTime(500);
    
    expect(screen.getByText('Tooltip content')).toBeInTheDocument();
  });

  it('renders React node as content', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    
    render(
      <Tooltip content={<span data-testid="custom-content">Custom</span>} delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    await user.hover(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });
  });
});

