import { useAccount } from 'wagmi';
import { Layout } from '@/components/layout/Layout';
import { AccessCard } from '@/components/AccessCard';
import { WalletConnect } from '@/components/WalletConnect';
import { useMint } from '@/hooks/useMint';
import { useAccess } from '@/hooks/useAccess';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { hasAccess, checkAccess } = useAccess(address);
  const { mintPass, loading, message } = useMint(address, checkAccess);

  return (
    <Layout>
      <WalletConnect />
      <AccessCard
        isConnected={isConnected}
        hasAccess={hasAccess}
        loading={loading}
        message={message}
        onMint={mintPass}
      />
    </Layout>
  );
}
