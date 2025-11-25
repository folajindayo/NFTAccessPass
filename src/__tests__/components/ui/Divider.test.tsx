import React from 'react';

import { Divider } from '@/components/ui/Divider';
import { render } from '@testing-library/react';

describe('Divider Component', () => {
  it('renders correctly', () => {
    const { container } = render(<Divider />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild?.nodeName).toBe('HR');
  });
});

