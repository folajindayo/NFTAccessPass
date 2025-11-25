import React from 'react';

import { Input } from '@/components/ui/Input';
import { render, screen } from '@testing-library/react';

describe('Input Component Render', () => {
  it('renders correctly with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('applies error styles correctly', () => {
    render(<Input error />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });
});

