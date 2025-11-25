import { useEffect, useState } from 'react';

import { AccessCard } from '@/components/AccessCard';
import { Layout } from '@/components/layout/Layout';
import { Meta } from '@/components/seo/Meta';
import { WalletConnect } from '@/components/WalletConnect';
import { useAccess } from '@/hooks/useAccess';
import { useAccount } from 'wagmi';
import { useMint } from '@/hooks/useMint';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const { hasAccess, checkAccess } = useAccess(address);
  const { mintPass, loading, message } = useMint(address, checkAccess);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Layout>
      <Meta />
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

