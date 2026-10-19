'use client';

import { useEffect } from 'react';

import { AppShell } from '@/components/AppShell';
import { PageIntro } from '@/components/PageIntro';
import { useTranslation } from '@/lib/i18n';

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
    <AppShell>
      <PageIntro
        description={t('common.error')}
        actionLabel={t('common.tryAgain')}
        onAction={() => retry()}
      />
    </AppShell>
  );
}
