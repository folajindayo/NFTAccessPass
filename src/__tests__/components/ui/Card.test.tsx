import React from 'react';

import { Card } from '@/components/ui/Card';
import { render, screen } from '@testing-library/react';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(<Card><div>Card Content</div></Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    render(<Card>Content</Card>);
    const card = screen.getByText('Content');
    expect(card).toHaveClass('bg-gray-800');
  });

  it('applies success variant classes', () => {
    render(<Card variant="success">Content</Card>);
    const card = screen.getByText('Content');
    expect(card).toHaveClass('bg-green-800');
  });
});
