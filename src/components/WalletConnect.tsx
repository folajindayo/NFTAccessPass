import React, { memo } from 'react';

/**
 * WalletConnect Component
 * Wraps the Reown AppKit button for wallet connection.
 * Memoized to prevent unnecessary re-renders.
 * Note: <appkit-button> is a web component.
 */
export const WalletConnect = memo(function WalletConnect() {
  return (
    <div className="mb-8 flex justify-center">
      {/* @ts-expect-error - appkit-button is a custom element */}
      <appkit-button />
    </div>
  );
});
