import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, spacing, typography } from '@/theme';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation();

  return (
    <main className={`flex min-h-screen flex-col items-center justify-center ${spacing.container} ${colors.background} ${colors.text.primary}`}>
      <h1 className={`${typography.h1} ${spacing.margin.bottom}`}>{t('common.appName')}</h1>
      {children}
    </main>
  );
};
