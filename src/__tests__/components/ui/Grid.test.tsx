import React from 'react';

import { Grid } from '@/components/ui/Grid';
import { render, screen } from '@testing-library/react';

describe('Grid Component', () => {
  it('renders children correctly', () => {
    render(<Grid>Content</Grid>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies grid classes', () => {
    render(<Grid data-testid="grid" cols={2} gap="small">Content</Grid>);
    const grid = screen.getByTestId('grid');
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('grid-cols-2');
    expect(grid).toHaveClass('gap-2');
  });
});

