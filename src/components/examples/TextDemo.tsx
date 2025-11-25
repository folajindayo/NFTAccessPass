import React from 'react';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { typography, spacing } from '@/theme';

export const TextDemo = () => {
  return (
    <Card>
      <h3 className={`${typography.h3} ${spacing.margin.bottom}`}>Text Variants</h3>
      <div className={`flex flex-col ${spacing.gap.small}`}>
        <Text>Body text (default)</Text>
        <Text variant="small">Small text</Text>
        <Text variant="muted">Muted text</Text>
      </div>
    </Card>
  );
};

