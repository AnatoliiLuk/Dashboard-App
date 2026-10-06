'use client';

import { Typography } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { safeNextPath } from '@/lib/auth/safeNextPath';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';

import { loadingStyle } from '@/app/page.style';

type GuestGuardProps = {
  children: ReactNode;
};

export function GuestGuard({ children }: GuestGuardProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(safeNextPath(searchParams.get('next')));
    }
  }, [isAuthenticated, router, searchParams]);

  if (isAuthenticated) {
    return <Typography sx={loadingStyle}>{t('common.loading')}</Typography>;
  }

  return children;
}
