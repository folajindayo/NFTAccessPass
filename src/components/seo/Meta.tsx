import React from 'react';
import Head from 'next/head';
import { useTranslation } from '@/hooks/useTranslation';

interface MetaProps {
  title?: string;
  description?: string;
  image?: string;
}

export const Meta: React.FC<MetaProps> = ({
  title,
  description,
  image = '/og-image.png' // Assuming we might add this later or it exists
}) => {
  const { t } = useTranslation();
  const siteTitle = title ? `${title} | ${t('common.appName')}` : t('common.appName');
  const siteDescription = description || t('common.appDescription') || 'Exclusive NFT Access Pass';

  return (
    <Head>
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

