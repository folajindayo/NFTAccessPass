import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// 1. Get projectId
const projectId = '1234567890abcdef1234567890abcdef'; // Replace with valid ID

// 2. Create Wagmi Adapter
const networks = [hardhat];
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks
});

// 3. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [hardhat],
  projectId,
  features: {
    analytics: true
  }
});

const client = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={client}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
