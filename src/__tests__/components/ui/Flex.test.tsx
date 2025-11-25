import React from 'react';

import { Flex } from '@/components/ui/Flex';
import { render, screen } from '@testing-library/react';

describe('Flex Component', () => {
  it('renders children correctly', () => {
    render(<Flex>Content</Flex>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies flex classes', () => {
    render(<Flex data-testid="flex" direction="col" align="center" justify="between">Content</Flex>);
    const flex = screen.getByTestId('flex');
    expect(flex).toHaveClass('flex');
    expect(flex).toHaveClass('flex-col');
    expect(flex).toHaveClass('items-center');
    expect(flex).toHaveClass('justify-between');
  });
});

