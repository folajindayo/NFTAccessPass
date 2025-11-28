import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '@/components/ui/Textarea';

describe('Textarea', () => {
  it('renders with default props', () => {
    render(<Textarea />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Textarea placeholder="Enter text..." />);
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Textarea label="Description" />);
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('renders with value', () => {
    render(<Textarea value="Test value" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('Test value');
  });

  it('calls onChange when typing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<Textarea onChange={onChange} />);
    
    await user.type(screen.getByRole('textbox'), 'Hello');
    
    expect(onChange).toHaveBeenCalled();
  });

  it('renders with character count', () => {
    render(<Textarea maxLength={100} showCount value="Test" onChange={() => {}} />);
    expect(screen.getByText('4/100')).toBeInTheDocument();
  });

  it('limits input to maxLength', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<Textarea maxLength={5} onChange={onChange} />);
    
    await user.type(screen.getByRole('textbox'), 'HelloWorld');
    
    expect(screen.getByRole('textbox')).toHaveValue('Hello');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Textarea disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('is readonly when readOnly prop is true', () => {
    render(<Textarea readOnly />);
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });

  it('renders with error state', () => {
    render(<Textarea error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error styling', () => {
    render(<Textarea error="Error" />);
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
  });

  it('renders with helper text', () => {
    render(<Textarea helperText="Enter a description" />);
    expect(screen.getByText('Enter a description')).toBeInTheDocument();
  });

  it('sets custom rows', () => {
    render(<Textarea rows={5} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
  });

  it('auto-resizes when autoResize is true', async () => {
    const user = userEvent.setup();
    
    render(<Textarea autoResize />);
    const textarea = screen.getByRole('textbox');
    
    await user.type(textarea, 'Line 1\nLine 2\nLine 3');
    
    // Auto-resize adjusts the height style
    expect(textarea.style.height).not.toBe('');
  });

  it('handles focus events', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    
    render(<Textarea onFocus={onFocus} onBlur={onBlur} />);
    const textarea = screen.getByRole('textbox');
    
    await user.click(textarea);
    expect(onFocus).toHaveBeenCalledTimes(1);
    
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Textarea className="custom-textarea" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-textarea');
  });

  it('shows warning when approaching maxLength', () => {
    render(
      <Textarea 
        maxLength={10} 
        showCount 
        value="123456789" 
        onChange={() => {}} 
      />
    );
    const count = screen.getByText('9/10');
    expect(count).toHaveClass('text-yellow-500');
  });

  it('shows error styling when at maxLength', () => {
    render(
      <Textarea 
        maxLength={10} 
        showCount 
        value="1234567890" 
        onChange={() => {}} 
      />
    );
    const count = screen.getByText('10/10');
    expect(count).toHaveClass('text-red-500');
  });

  it('associates label with textarea via id', () => {
    render(<Textarea id="my-textarea" label="My Label" />);
    const label = screen.getByText('My Label');
    expect(label).toHaveAttribute('for', 'my-textarea');
  });
});

