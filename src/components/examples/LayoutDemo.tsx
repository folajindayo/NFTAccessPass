import React from 'react';

import { Box } from '@/components/ui/Box';
import { Divider } from '@/components/ui/Divider';
import { Flex } from '@/components/ui/Flex';
import { Grid } from '@/components/ui/Grid';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';
import { spacing, typography } from '@/theme';

export const LayoutDemo = () => {
  return (
    <Flex direction="col" className={spacing.gap.medium}>
      <Box>
        <Heading level={2} className={spacing.margin.bottom}>Layout Components</Heading>
        <Text>Examples of Box, Flex, Grid, and Divider.</Text>
      </Box>
      
      <Divider />

      <Box>
        <Heading level={3} className={spacing.margin.bottom}>Flex Row</Heading>
        <Flex justify="between" className="bg-gray-800 p-4 rounded">
          <Box className="bg-blue-600 p-2 rounded">Item 1</Box>
          <Box className="bg-blue-600 p-2 rounded">Item 2</Box>
          <Box className="bg-blue-600 p-2 rounded">Item 3</Box>
        </Flex>
      </Box>

      <Divider />

      <Box>
        <Heading level={3} className={spacing.margin.bottom}>Grid (2 cols)</Heading>
        <Grid cols={2} gap="medium">
          <Box className="bg-green-800 p-4 rounded">Col 1</Box>
          <Box className="bg-green-800 p-4 rounded">Col 2</Box>
        </Grid>
      </Box>
    </Flex>
  );
};

