import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { PROJECT_ID } from '@/constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { WagmiProvider } from 'wagmi';
import { createAppKit } from '@reown/appkit/react';
import { hardhat, mainnet, sepolia } from 'wagmi/chains';

import '@/styles/globals.css';

/**
 * Supported networks configuration
 */
const networks = [hardhat, sepolia, mainnet];

/**
 * Wagmi adapter configuration
 */
const wagmiAdapter = new WagmiAdapter({
  projectId: PROJECT_ID,
  networks,
});

/**
 * Initialize AppKit
 */
const initializeAppKit = () => {
  createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId: PROJECT_ID,
    features: {
      analytics: true,
      email: false,
      socials: [],
    },
    metadata: {
      name: 'NFT Access Pass',
      description: 'NFT-gated access control system',
      url: typeof window !== 'undefined' ? window.location.origin : '',
      icons: ['/favicon.ico'],
    },
    themeMode: 'dark',
  });
};

// Initialize on module load (client-side only)
if (typeof window !== 'undefined') {
  initializeAppKit();
}

/**
 * Query client with optimized defaults
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes (was cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Error fallback component
 */
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 max-w-md">
        <h2 className="text-xl font-semibold text-red-400 mb-2">Something went wrong</h2>
        <p className="text-sm text-red-300/80 mb-4">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

/**
 * Providers wrapper component
 */
function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

/**
 * Main App component
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset app state on error recovery
        queryClient.clear();
      }}
    >
      <Providers>
        <Component {...pageProps} />
      </Providers>
    </ErrorBoundary>
  );
}
