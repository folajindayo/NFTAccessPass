import React from 'react';
import { render, screen } from '@testing-library/react';
import { Label } from '@/components/ui/Label';

describe('Label Component', () => {
  it('renders children correctly', () => {
    render(<Label htmlFor="test-input">Test Label</Label>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Label')).toHaveAttribute('for', 'test-input');
  });
});
