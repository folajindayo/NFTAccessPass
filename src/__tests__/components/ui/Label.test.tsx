import React from 'react';

import { Label } from '@/components/ui/Label';
import { render, screen } from '@testing-library/react';

describe('Label Component', () => {
  it('renders children correctly', () => {
    render(<Label>Username</Label>);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('associates with input via htmlFor', () => {
    render(
      <>
        <Label htmlFor="username">Username</Label>
        <input id="username" />
      </>
    );
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });
});
