'use client';

import { Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { AppShell } from '@/components/AppShell';
import { AuthGuard } from '@/components/AuthGuard';
import { OAuthConsent } from '@/components/OAuthConsent';
import { PageHeader } from '@/components/PageHeader';
import { useTranslation } from '@/lib/i18n';

import { loadingStyle } from '@/app/page.style';

export function OAuthConsentView() {
  const { t } = useTranslation();

  // AuthGuard sends a signed-out person to /login and back here, query
  // string included, so the pending authorization survives sign-in.
  return (
    <AppShell>
      <AuthGuard>
        <PageHeader title={t('oauth.title')} />
        <Suspense
          fallback={
            <Typography sx={loadingStyle}>{t('common.loading')}</Typography>
          }
        >
          <ConsentFromUrl />
        </Suspense>
      </AuthGuard>
    </AppShell>
  );
}

// useSearchParams needs a Suspense boundary for prerendering.
function ConsentFromUrl() {
  const searchParams = useSearchParams();
  return <OAuthConsent request={searchParams.get('request') ?? ''} />;
}
