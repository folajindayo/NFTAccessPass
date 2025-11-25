import React from 'react';

import { Button } from '@/components/ui/Button';
import { render, screen, fireEvent } from '@testing-library/react';

describe('Button Component Events', () => {
  it('handles onClick events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

