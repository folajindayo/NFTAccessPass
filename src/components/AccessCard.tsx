import React from 'react';

import { AccessCardProps } from '@/types';
import { colors, spacing, typography } from '@/theme';
import { useTranslation } from '@/hooks/useTranslation';

import { Button } from './ui/Button';
import { Card } from './ui/Card';

/**
 * Component to display the user's access status.
 * Shows a success card if they have access, or a mint button if they don't.
 * 
 * @param props - AccessCardProps including connection status, access flag, and callbacks.
 */
export const AccessCard = ({ 
  isConnected, 
  hasAccess, 
  loading, 
  message, 
  onMint 
}: AccessCardProps) => {
  const { t } = useTranslation();

  if (!isConnected) {
    return <p className={colors.text.muted}>{t('common.connectWallet')}</p>;
  }

  return (
    <div className={`flex flex-col items-center ${spacing.gap.small}`}>
      {hasAccess ? (
        <Card variant="success">
          <h2 className={typography.h2}>{t('common.accessGranted')}</h2>
          <p>{t('common.holdPass')}</p>
        </Card>
      ) : (
        <Card>
          <h2 className={typography.h3}>{t('common.noAccess')}</h2>
          <Button
            onClick={onMint}
            isLoading={loading}
          >
            {t('common.mintPass')}
          </Button>
        </Card>
      )}
      {message && <p className={`${spacing.margin.top} ${typography.small} ${colors.text.secondary}`}>{message}</p>}
    </div>
  );
};
