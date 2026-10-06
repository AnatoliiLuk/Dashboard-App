'use client';

import { Box, Button, Link, Typography } from '@mui/material';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { LocaleSwitch } from '@/components/LocaleSwitch';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';

import { mainStyle, pageStyle } from '@/app/page.style';

import { menu } from './AppShell.constants';
import {
  barEndStyle,
  barStartStyle,
  barStyle,
  brandStyle,
  descriptionStyle,
  headerStyle,
  menuItemActiveStyle,
  menuItemStyle,
  menuStyle,
} from './AppShell.style';

type AppShellProps = {
  description: string;
  children: ReactNode;
};

export function AppShell({ description, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { isAuthReady, isAuthenticated, logout } = useAuth();

  let authAction: ReactNode;
  if (!isAuthReady) {
    authAction = (
      <Button
        size="small"
        variant="text"
        disabled
        tabIndex={-1}
        aria-hidden
        sx={{ visibility: 'hidden' }}
      >
        {t('shell.signOut')}
      </Button>
    );
  } else if (isAuthenticated) {
    authAction = (
      <Button
        size="small"
        variant="text"
        onClick={() => {
          logout();
          router.replace('/login');
        }}
      >
        {t('shell.signOut')}
      </Button>
    );
  } else {
    authAction = (
      <Button variant="outlined" component={NextLink} href="/login">
        {t('shell.signIn')}
      </Button>
    );
  }

  return (
    <Box sx={pageStyle}>
      <Box component="main" sx={mainStyle}>
        <Box component="header" sx={headerStyle}>
          <Box sx={barStyle}>
            <Box sx={barStartStyle}>
              <Typography variant="h1" component="h1" sx={brandStyle}>
                {t('shell.brand')}
              </Typography>
              <Box component="nav" sx={menuStyle} aria-label={t('shell.menu')}>
                {menu.map(({ href, label }) => {
                  const current = pathname === href;
                  return (
                    <Link
                      key={href}
                      component={NextLink}
                      href={href}
                      aria-current={current ? 'page' : undefined}
                      underline="none"
                      sx={[menuItemStyle, current ? menuItemActiveStyle : null]}
                    >
                      {t(label)}
                    </Link>
                  );
                })}
              </Box>
            </Box>
            <Box sx={barEndStyle}>
              <LocaleSwitch />
              <ThemeToggle />
              {authAction}
            </Box>
          </Box>
          <Typography sx={descriptionStyle}>{description}</Typography>
        </Box>
        {children}
      </Box>
    </Box>
  );
}
