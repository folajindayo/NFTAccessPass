import React from 'react';
import { render, screen } from '@testing-library/react';
import { Label } from '@/components/ui/Label';

describe('Label Component', () => {
  it('renders children correctly', () => {
    render(<Label>Username</Label>);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('shows required asterisk', () => {
    render(<Label required>Username</Label>);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
