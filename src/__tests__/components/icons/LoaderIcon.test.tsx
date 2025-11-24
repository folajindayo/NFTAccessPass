import React from 'react';
import { render } from '@testing-library/react';
import { LoaderIcon } from '@/components/icons/LoaderIcon';

describe('LoaderIcon', () => {
  it('renders correctly', () => {
    const { container } = render(<LoaderIcon />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild?.nodeName).toBe('svg');
  });

  it('applies animate-spin class by default', () => {
    const { container } = render(<LoaderIcon />);
    expect(container.firstChild).toHaveClass('animate-spin');
  });

  it('applies className prop', () => {
    const { container } = render(<LoaderIcon className="test-class" />);
    expect(container.firstChild).toHaveClass('test-class');
  });
});

