import React from 'react';

import { Input } from '@/components/ui/Input';
import { render, screen, fireEvent } from '@testing-library/react';

describe('Input Component Events', () => {
  it('handles change events', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
  });
});

