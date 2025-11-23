import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, spacing, typography } from '@/theme';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t, locale, changeLocale } = useTranslation();

  return (
    <main className={`flex min-h-screen flex-col items-center justify-center ${spacing.container} ${colors.background} ${colors.text.primary} relative`}>
      <div className="absolute top-4 right-4 flex gap-2">
        <button 
          onClick={() => changeLocale('en')}
          className={`px-2 py-1 rounded ${locale === 'en' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          EN
        </button>
        <button 
          onClick={() => changeLocale('es')}
          className={`px-2 py-1 rounded ${locale === 'es' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          ES
        </button>
      </div>
      <h1 className={`${typography.h1} ${spacing.margin.bottom}`}>{t('common.appName')}</h1>
      {children}
    </main>
  );
};
