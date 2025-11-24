import React from 'react';
import { render, screen } from '@testing-library/react';
import { Label } from '@/components/ui/Label';

describe('Label Component', () => {
  it('renders children correctly', () => {
    render(<Label>Test Label</Label>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('shows asterisk when required', () => {
    render(<Label required>Required Label</Label>);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});

