/**
 * App Provider
 * Combines all context providers for the application
 */

import React from 'react';

import { WalletProvider } from './WalletContext';
import { AccessProvider } from './AccessContext';

/**
 * App provider props
 */
interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * Combined app provider
 * Wraps all context providers in the correct order
 */
export function AppProvider({ children }: AppProviderProps) {
  return (
    <WalletProvider>
      <AccessProvider autoCheck={true} checkInterval={60000}>
        {children}
      </AccessProvider>
    </WalletProvider>
  );
}

export default AppProvider;

