import React from 'react';

import { Box } from '@/components/ui/Box';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { spacing } from '@/theme';

export const FormDemo = () => {
  return (
    <Box className="w-full max-w-md bg-gray-800 p-6 rounded-xl">
      <Heading level={3} className={spacing.margin.bottom}>Form Components</Heading>
      
      <form className="flex flex-col gap-4">
        <Box>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" placeholder="name@example.com" />
        </Box>

        <Box>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" />
        </Box>

        <Box>
          <Label htmlFor="error">Error State</Label>
          <Input id="error" hasError placeholder="Invalid input" defaultValue="Invalid" />
        </Box>

        <Button type="button" className="mt-2">Submit</Button>
      </form>
    </Box>
  );
};

