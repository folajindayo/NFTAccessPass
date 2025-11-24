import React from 'react';
import { Box } from '@/components/ui/Box';
import { Card } from '@/components/ui/Card';
import { typography, spacing } from '@/theme';

export const BoxDemo = () => {
  return (
    <Card>
      <h3 className={`${typography.h3} ${spacing.margin.bottom}`}>Box Component</h3>
      <Box className="bg-blue-900 p-4 rounded text-white">
        This is content inside a Box with custom classes.
      </Box>
    </Card>
  );
};

