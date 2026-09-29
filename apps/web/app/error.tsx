'use client';

import { Box } from '@mui/material';
import { useEffect } from 'react';

import { AppShell } from '@/components/AppShell';
import { useTranslation } from '@/lib/i18n';

import { retryStyle } from './error.style';

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AppShell description={t('common.error')}>
      <Box
        component="button"
        type="button"
        sx={retryStyle}
        onClick={() => retry()}
      >
        {t('common.tryAgain')}
      </Box>
    </AppShell>
  );
}
