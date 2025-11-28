import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '@/components/ui/Select';

describe('Select', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('renders with default props', () => {
    render(<Select options={options} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Select options={options} placeholder="Select an option" />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Select options={options} label="Choose option" />);
    expect(screen.getByText('Choose option')).toBeInTheDocument();
  });

  it('displays options when clicked', async () => {
    const user = userEvent.setup();
    render(<Select options={options} />);
    
    await user.click(screen.getByRole('combobox'));
    
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });
  });

  it('calls onChange when option is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<Select options={options} onChange={onChange} />);
    
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Option 2'));
    
    expect(onChange).toHaveBeenCalledWith('option2');
  });

  it('displays selected value', async () => {
    const user = userEvent.setup();
    
    render(<Select options={options} value="option2" />);
    
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('closes dropdown after selection', async () => {
    const user = userEvent.setup();
    
    render(<Select options={options} />);
    
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Option 1'));
    
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('is disabled when disabled prop is true', () => {
    render(<Select options={options} disabled />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();
    
    render(<Select options={options} disabled />);
    
    await user.click(screen.getByRole('combobox'));
    
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('renders with error state', () => {
    render(<Select options={options} error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error styling', () => {
    const { container } = render(<Select options={options} error="Error" />);
    expect(container.querySelector('.border-red-500')).toBeInTheDocument();
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<Select options={options} onChange={onChange} />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    
    expect(onChange).toHaveBeenCalled();
  });

  it('closes on Escape key', async () => {
    const user = userEvent.setup();
    
    render(<Select options={options} />);
    
    await user.click(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('renders disabled options', async () => {
    const user = userEvent.setup();
    const optionsWithDisabled = [
      { value: 'opt1', label: 'Option 1' },
      { value: 'opt2', label: 'Option 2', disabled: true },
    ];
    
    render(<Select options={optionsWithDisabled} />);
    
    await user.click(screen.getByRole('combobox'));
    
    const disabledOption = screen.getByText('Option 2');
    expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
  });

  it('applies custom className', () => {
    const { container } = render(<Select options={options} className="custom-select" />);
    expect(container.firstChild).toHaveClass('custom-select');
  });

  it('renders native variant', () => {
    render(<Select options={options} native />);
    const nativeSelect = screen.getByRole('combobox');
    expect(nativeSelect.tagName).toBe('SELECT');
  });
});

