import React from 'react';

export const WalletConnect = () => {
  return (
    <div className="mb-8">
      {/* @ts-expect-error - web component */}
      <appkit-button />
    </div>
  );
};
