import React from 'react';

import { Card } from '@/components/ui/Card';
import { typography, spacing } from '@/theme';

export const CardDemo = () => {
  return (
    <div className={`flex flex-col ${spacing.gap.medium} w-full max-w-md`}>
      <h3 className={`${typography.h3} text-center`}>Card Variants</h3>
      
      <Card>
        <h4 className={typography.body}>Default Card</h4>
        <p className={typography.small}>Standard container style.</p>
      </Card>

      <Card variant="success">
        <h4 className={typography.body}>Success Card</h4>
        <p className={typography.small}>Used for positive feedback.</p>
      </Card>
    </div>
  );
};

