import React from 'react';
import { render, screen } from '@testing-library/react';
import { Text } from '@/components/ui/Text';

describe('Text Component', () => {
  it('renders children correctly', () => {
    render(<Text>Paragraph content</Text>);
    expect(screen.getByText('Paragraph content')).toBeInTheDocument();
  });

  it('applies small variant classes', () => {
    render(<Text variant="small">Small text</Text>);
    const text = screen.getByText('Small text');
    expect(text).toHaveClass('text-sm');
  });
});

