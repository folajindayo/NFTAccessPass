import React from 'react';
import { APP_NAME } from '@/constants';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">{APP_NAME}</h1>
      {children}
    </main>
  );
};

