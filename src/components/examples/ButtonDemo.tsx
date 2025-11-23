import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { typography, spacing } from '@/theme';

export const ButtonDemo = () => {
  return (
    <Card>
      <h3 className={`${typography.h3} ${spacing.margin.bottom}`}>Button Variants</h3>
      <div className={`flex ${spacing.gap.small}`}>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button isLoading>Loading</Button>
        <Button disabled>Disabled</Button>
      </div>
    </Card>
  );
};

