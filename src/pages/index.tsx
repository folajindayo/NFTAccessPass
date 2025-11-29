import { useEffect, useState, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';

import { AccessCard } from '@/components/AccessCard';
import { Layout } from '@/components/layout/Layout';
import { Meta } from '@/components/seo/Meta';
import { WalletConnect } from '@/components/WalletConnect';
import { NetworkBadge } from '@/components/NetworkBadge';
import { useAccess } from '@/hooks/useAccess';
import { useMint } from '@/hooks/useMint';
import { useTranslation } from '@/hooks/useTranslation';
import { Heading, Text, Box, Flex, Card } from '@/components/ui';

/**
 * Feature card component
 */
function FeatureCard({ 
  title, 
  description, 
  icon 
}: { 
  title: string; 
  description: string; 
  icon: string;
}) {
  return (
    <Card className="p-4 bg-background/50 backdrop-blur border border-foreground/10">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-foreground/60">{description}</p>
    </Card>
  );
}

/**
 * Features section
 */
function FeaturesSection() {
  const features = [
    {
      icon: '🔐',
      title: 'Token Gated Access',
      description: 'Exclusive access controlled by NFT ownership',
    },
    {
      icon: '⚡',
      title: 'Instant Verification',
      description: 'Real-time blockchain verification',
    },
    {
      icon: '🎨',
      title: 'Unique Pass',
      description: 'Each NFT is a unique digital access pass',
    },
  ];

  return (
    <Box className="mt-12">
      <Heading level={2} className="text-center mb-6">
        Features
      </Heading>
      <Flex className="gap-4 flex-col md:flex-row">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </Flex>
    </Box>
  );
}

/**
 * Status bar component
 */
function StatusBar() {
  const chainId = useChainId();
  const { isConnected } = useAccount();

  if (!isConnected) return null;

  return (
    <Flex className="justify-center gap-2 mb-4">
      <NetworkBadge chainId={chainId} />
    </Flex>
  );
}

/**
 * Hero section
 */
function HeroSection() {
  const { t } = useTranslation();

  return (
    <Box className="text-center mb-8">
      <Heading level={1} className="text-3xl md:text-4xl font-bold mb-4">
        {t('common.title')}
      </Heading>
      <Text className="text-foreground/70 max-w-md mx-auto">
        Secure, blockchain-verified access control powered by NFTs. 
        Connect your wallet to get started.
      </Text>
    </Box>
  );
}

/**
 * Main access section
 */
function AccessSection() {
  const { address, isConnected } = useAccount();
  const { hasAccess, checkAccess, isLoading: accessLoading } = useAccess(address);
  const { mintPass, loading: mintLoading, message } = useMint(address, checkAccess);

  const handleMint = useCallback(async () => {
    await mintPass();
  }, [mintPass]);

  return (
    <Box className="flex flex-col items-center gap-6">
      <WalletConnect />
      <AccessCard
        isConnected={isConnected}
        hasAccess={hasAccess}
        loading={mintLoading || accessLoading}
        message={message}
        onMint={handleMint}
      />
    </Box>
  );
}

/**
 * Home page component
 */
export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Layout>
        <Meta />
        <Box className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-pulse text-foreground/50">Loading...</div>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Meta 
        title="NFT Access Pass - Token Gated Access"
        description="Secure, blockchain-verified access control powered by NFTs"
      />
      <StatusBar />
      <HeroSection />
      <AccessSection />
      <FeaturesSection />
    </Layout>
  );
}
