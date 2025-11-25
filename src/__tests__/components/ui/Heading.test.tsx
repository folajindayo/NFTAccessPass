import React from 'react';

import { Heading } from '@/components/ui/Heading';
import { render, screen } from '@testing-library/react';

describe('Heading Component', () => {
  it('renders h1 by default', () => {
    render(<Heading>Title</Heading>);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Title');
  });

  it('renders h2 when level is 2', () => {
    render(<Heading level={2}>Subtitle</Heading>);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
  });
});

