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
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      const next = encodeURIComponent(pathname || '/');
      router.replace(`/login?next=${next}`);
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated) {
    return <Typography sx={loadingStyle}>{t('common.loading')}</Typography>;
  }

  return children;
}
