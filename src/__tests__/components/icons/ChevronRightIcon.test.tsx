import React from 'react';
import { render } from '@testing-library/react';
import { ChevronRightIcon } from '@/components/icons/ChevronRightIcon';

describe('ChevronRightIcon', () => {
  it('renders correctly', () => {
    const { container } = render(<ChevronRightIcon />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild?.nodeName).toBe('svg');
  });

  it('applies className prop', () => {
    const { container } = render(<ChevronRightIcon className="test-class" />);
    expect(container.firstChild).toHaveClass('test-class');
  });
});

