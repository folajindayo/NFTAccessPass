import React from 'react';

import { CheckIcon } from '@/components/icons/CheckIcon';
import { render } from '@testing-library/react';

describe('CheckIcon', () => {
  it('renders correctly', () => {
    const { container } = render(<CheckIcon />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild?.nodeName).toBe('svg');
  });

  it('applies className prop', () => {
    const { container } = render(<CheckIcon className="test-class" />);
    expect(container.firstChild).toHaveClass('test-class');
  });
});

