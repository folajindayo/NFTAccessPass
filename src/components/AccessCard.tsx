import React, { memo, useCallback, useMemo } from 'react';

import { AccessCardProps } from '@/types';
import { colors, spacing, typography } from '@/theme';
import { useTranslation } from '@/hooks/useTranslation';

import { Button } from './ui/Button';
import { Card } from './ui/Card';

/**
 * Success card content - memoized to prevent re-renders
 */
const SuccessContent = memo(function SuccessContent() {
  const { t } = useTranslation();
  
  return (
    <Card variant="success">
      <h2 className={typography.h2}>{t('common.accessGranted')}</h2>
      <p>{t('common.holdPass')}</p>
    </Card>
  );
});

/**
 * No access card content with mint button - memoized
 */
const NoAccessContent = memo(function NoAccessContent({ 
  loading, 
  onMint 
}: { 
  loading: boolean; 
  onMint: () => void 
}) {
  const { t } = useTranslation();
  
  return (
    <Card>
      <h2 className={typography.h3}>{t('common.noAccess')}</h2>
      <Button
        onClick={onMint}
        isLoading={loading}
      >
        {t('common.mintPass')}
      </Button>
    </Card>
  );
});

/**
 * Component to display the user's access status.
 * Shows a success card if they have access, or a mint button if they don't.
 * Optimized with React.memo to prevent unnecessary re-renders.
 * 
 * @param props - AccessCardProps including connection status, access flag, and callbacks.
 */
export const AccessCard = memo(function AccessCard({ 
  isConnected, 
  hasAccess, 
  loading, 
  message, 
  onMint 
}: AccessCardProps) {
  const { t } = useTranslation();

  // Memoize the mint callback to prevent child re-renders
  const handleMint = useCallback(() => {
    onMint();
  }, [onMint]);

  // Memoize class strings
  const containerClass = useMemo(
    () => `flex flex-col items-center ${spacing.gap.small}`,
    []
  );

  const messageClass = useMemo(
    () => `${spacing.margin.top} ${typography.small} ${colors.text.secondary}`,
    []
  );

  if (!isConnected) {
    return <p className={colors.text.muted}>{t('common.connectWallet')}</p>;
  }

  return (
    <div className={containerClass}>
      {hasAccess ? (
        <SuccessContent />
      ) : (
        <NoAccessContent loading={loading} onMint={handleMint} />
      )}
      {message && <p className={messageClass}>{message}</p>}
    </div>
  );
});
