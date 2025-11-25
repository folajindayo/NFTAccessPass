import React from 'react';

import { Box } from '@/components/ui/Box';
import { Card } from '@/components/ui/Card';
import { Flex } from '@/components/ui/Flex';
import { typography, spacing } from '@/theme';

export const FlexDemo = () => {
  return (
    <Card>
      <h3 className={`${typography.h3} ${spacing.margin.bottom}`}>Flex Component</h3>
      <Flex justify="between" className="w-full bg-gray-700 p-2 rounded">
        <Box className="bg-blue-600 p-2">Left</Box>
        <Box className="bg-blue-600 p-2">Center</Box>
        <Box className="bg-blue-600 p-2">Right</Box>
      </Flex>
    </Card>
  );
};

