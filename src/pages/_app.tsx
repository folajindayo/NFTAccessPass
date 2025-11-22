import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { PROJECT_ID } from '@/constants';

const networks = [hardhat];
const wagmiAdapter = new WagmiAdapter({
  projectId: PROJECT_ID,
  networks
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [hardhat],
  projectId: PROJECT_ID,
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
