import React from 'react';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { typography, spacing } from '@/theme';

export const InputDemo = () => {
  return (
    <Card>
      <h3 className={`${typography.h3} ${spacing.margin.bottom}`}>Input Variants</h3>
      <div className={`flex flex-col ${spacing.gap.small} w-full`}>
        <Input placeholder="Default Input" />
        <Input placeholder="Error Input" error />
        <Input placeholder="Disabled Input" disabled />
      </div>
    </Card>
  );
};

