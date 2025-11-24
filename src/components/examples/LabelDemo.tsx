import React from 'react';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { typography, spacing } from '@/theme';

export const LabelDemo = () => {
  return (
    <Card>
      <h3 className={`${typography.h3} ${spacing.margin.bottom}`}>Label Usage</h3>
      <div className="w-full">
        <Label htmlFor="demo-input">Email Address</Label>
        <Input id="demo-input" placeholder="name@example.com" />
      </div>
    </Card>
  );
};

