import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '@/components/ui/Switch';

describe('Switch', () => {
  it('renders with default props', () => {
    render(<Switch />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).not.toBeChecked();
  });

  it('renders as checked when checked prop is true', () => {
    render(<Switch checked />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('calls onChange when toggled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<Switch onChange={onChange} />);
    
    await user.click(screen.getByRole('switch'));
    
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('toggles between checked states', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    const { rerender } = render(<Switch checked={false} onChange={onChange} />);
    
    await user.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
    
    rerender(<Switch checked={true} onChange={onChange} />);
    
    await user.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('renders with label', () => {
    render(<Switch label="Enable notifications" />);
    expect(screen.getByText('Enable notifications')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(<Switch label="Email" description="Receive email notifications" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Receive email notifications')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Switch disabled />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDisabled();
  });

  it('does not call onChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<Switch disabled onChange={onChange} />);
    
    await user.click(screen.getByRole('switch'));
    
    expect(onChange).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(<Switch className="custom-switch" />);
    expect(container.firstChild).toHaveClass('custom-switch');
  });

  it('has correct aria attributes', () => {
    render(<Switch id="test-switch" label="Test" />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('id', 'test-switch');
    expect(switchElement).toHaveAttribute('aria-checked');
  });

  it('associates label with switch via htmlFor', () => {
    render(<Switch id="my-switch" label="My Switch" />);
    const label = screen.getByText('My Switch');
    expect(label.closest('label')).toHaveAttribute('for', 'my-switch');
  });

  it('can be toggled via keyboard', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<Switch onChange={onChange} />);
    const switchElement = screen.getByRole('switch');
    
    switchElement.focus();
    await user.keyboard(' ');
    
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('renders with different sizes', () => {
    const { rerender, container } = render(<Switch size="sm" />);
    expect(container.querySelector('.w-8')).toBeInTheDocument();

    rerender(<Switch size="md" />);
    expect(container.querySelector('.w-11')).toBeInTheDocument();

    rerender(<Switch size="lg" />);
    expect(container.querySelector('.w-14')).toBeInTheDocument();
  });

  it('shows checked state visually', () => {
    const { rerender, container } = render(<Switch checked={false} />);
    expect(container.querySelector('.bg-gray-200')).toBeInTheDocument();

    rerender(<Switch checked={true} />);
    expect(container.querySelector('.bg-indigo-600')).toBeInTheDocument();
  });
});

