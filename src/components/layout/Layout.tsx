import React from 'react';
import { useAccount } from 'wagmi';

import { colors, spacing, typography } from '@/theme';
import { useTranslation } from '@/hooks/useTranslation';
import { Flex, Box, Text } from '@/components/ui';

/**
 * Layout props
 */
interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * Language switcher component
 */
function LanguageSwitcher() {
  const { locale, changeLocale } = useTranslation();
  
  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
  ] as const;

  return (
    <Flex className="gap-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLocale(lang.code)}
          className={`
            px-2 py-1 rounded text-xs font-medium transition-colors
            ${locale === lang.code 
              ? 'bg-blue-600 text-white' 
              : 'bg-foreground/10 text-foreground/70 hover:bg-foreground/20'
            }
          `}
          aria-label={`Switch to ${lang.code === 'en' ? 'English' : 'Spanish'}`}
          aria-pressed={locale === lang.code}
        >
          {lang.label}
        </button>
      ))}
    </Flex>
  );
}

/**
 * Header component
 */
function Header() {
  const { t } = useTranslation();
  const { isConnected } = useAccount();

  return (
    <header className="w-full py-4">
      <Flex className="justify-between items-center">
        <Text className="font-bold text-lg text-foreground">
          {t('common.appName')}
        </Text>
        <Flex className="items-center gap-4">
          <LanguageSwitcher />
          {isConnected && (
            <div className="w-2 h-2 rounded-full bg-green-500" title="Connected" />
          )}
        </Flex>
      </Flex>
    </header>
  );
}

/**
 * Footer component
 */
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 mt-auto">
      <Flex className="justify-center items-center gap-4 text-foreground/50 text-sm">
        <Text>© {currentYear} NFT Access Pass</Text>
        <span className="text-foreground/20">|</span>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-foreground/70 transition-colors"
        >
          GitHub
        </a>
      </Flex>
    </footer>
  );
}

/**
 * Max width classes
 */
const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
};

/**
 * Layout component
 * Provides consistent page structure with header, content, and footer
 */
export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showHeader = true, 
  showFooter = true,
  maxWidth = 'lg',
}) => {
  return (
    <Box 
      className={`
        min-h-screen 
        flex flex-col 
        ${colors.background} 
        ${colors.text.primary}
      `}
    >
      <Box className={`
        w-full 
        mx-auto 
        px-4 
        ${maxWidthClasses[maxWidth]}
        flex flex-col 
        flex-1
      `}>
        {showHeader && <Header />}
        
        <main className={`
          flex-1 
          flex flex-col 
          items-center 
          justify-center 
          py-8
        `}>
          {children}
        </main>
        
        {showFooter && <Footer />}
      </Box>
    </Box>
  );
};

/**
 * Default export for compatibility
 */
export default Layout;
