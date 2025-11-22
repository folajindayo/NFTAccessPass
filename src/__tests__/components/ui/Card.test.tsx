import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from '@/components/ui/Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(<Card><div>Card Content</div></Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    render(<Card>Content</Card>);
    // We check for a class that is specific to the default variant
    // Note: This is a bit fragile if classes change, but good for now
    // The container is the first child
    const card = screen.getByText('Content').parentElement;
    expect(card).toHaveClass('bg-gray-800');
  });

  it('applies success variant classes', () => {
    render(<Card variant="success">Content</Card>);
    const card = screen.getByText('Content').parentElement;
    expect(card).toHaveClass('bg-green-800');
  });
});

