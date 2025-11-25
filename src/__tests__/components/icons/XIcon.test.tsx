import React from 'react';

import { XIcon } from '@/components/icons/XIcon';
import { render } from '@testing-library/react';

describe('XIcon', () => {
  it('renders correctly', () => {
    const { container } = render(<XIcon />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild?.nodeName).toBe('svg');
  });

  it('applies className prop', () => {
    const { container } = render(<XIcon className="test-class" />);
    expect(container.firstChild).toHaveClass('test-class');
  });
});

