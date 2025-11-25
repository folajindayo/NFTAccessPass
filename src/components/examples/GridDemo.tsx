import React from 'react';

import { Box } from '@/components/ui/Box';
import { Card } from '@/components/ui/Card';
import { Grid } from '@/components/ui/Grid';
import { typography, spacing } from '@/theme';

export const GridDemo = () => {
  return (
    <Card>
      <h3 className={`${typography.h3} ${spacing.margin.bottom}`}>Grid Component</h3>
      <Grid cols={2} gap="medium" className="w-full">
        <Box className="bg-green-800 p-4 rounded">Col 1</Box>
        <Box className="bg-green-800 p-4 rounded">Col 2</Box>
        <Box className="bg-green-800 p-4 rounded">Col 3</Box>
        <Box className="bg-green-800 p-4 rounded">Col 4</Box>
      </Grid>
    </Card>
  );
};

