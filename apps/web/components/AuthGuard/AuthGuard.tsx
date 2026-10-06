'use client';

import { Typography } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { useAuth } from '@/lib/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';

import { loadingStyle } from '@/app/page.style';

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const { t } = useTranslation();
  const { isAuthReady, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthReady || isAuthenticated) {
      return;
    }

    const next = encodeURIComponent(pathname || '/');
    router.replace(`/login?next=${next}`);
  }, [isAuthReady, isAuthenticated, pathname, router]);

  if (!isAuthReady || !isAuthenticated) {
    return <Typography sx={loadingStyle}>{t('common.loading')}</Typography>;
  }

  return children;
}
