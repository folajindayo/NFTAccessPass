import React from 'react';

import { Card } from '@/components/ui/Card';
import { Heading } from '@/components/ui/Heading';
import { typography, spacing } from '@/theme';

export const HeadingDemo = () => {
  return (
    <Card>
      <h3 className={`${typography.h3} ${spacing.margin.bottom}`}>Heading Variants</h3>
      <div className={`flex flex-col ${spacing.gap.small}`}>
        <Heading level={1}>Heading 1</Heading>
        <Heading level={2}>Heading 2</Heading>
        <Heading level={3}>Heading 3</Heading>
      </div>
    </Card>
  );
};

