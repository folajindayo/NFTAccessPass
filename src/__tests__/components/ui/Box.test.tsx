import React from 'react';

import { Box } from '@/components/ui/Box';
import { render, screen } from '@testing-library/react';

describe('Box Component', () => {
  it('renders children correctly', () => {
    render(<Box>Content</Box>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('passes through props', () => {
    render(<Box data-testid="box" className="test-class">Content</Box>);
    const box = screen.getByTestId('box');
    expect(box).toHaveClass('test-class');
  });
});

