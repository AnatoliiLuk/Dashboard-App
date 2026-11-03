'use client';

import { Box, Link } from '@mui/material';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { AccountMenu } from '@/components/AccountMenu';
import { MobileNav } from '@/components/MobileNav';
import { useTranslation } from '@/lib/i18n';

import { isCurrentRoute, MAIN_ID, menu } from './AppShell.constants';
import {
  brandStyle,
  contentStyle,
  headerEndStyle,
  headerInnerStyle,
  headerStyle,
  mainStyle,
  menuItemActiveStyle,
  menuItemStyle,
  menuStyle,
  shellStyle,
  skipLinkStyle,
} from './AppShell.style';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <Box sx={shellStyle}>
      <Link href={`#${MAIN_ID}`} sx={skipLinkStyle}>
        {t('shell.skipToContent')}
      </Link>
      <Box component="header" sx={headerStyle}>
        <Box sx={headerInnerStyle}>
          <Link component={NextLink} href="/" underline="none" sx={brandStyle}>
            {t('shell.brand')}
          </Link>
          <Box component="nav" sx={menuStyle} aria-label={t('shell.menu')}>
            {menu.map(({ href, label }) => {
              const current = isCurrentRoute(pathname, href);
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
          <Box sx={headerEndStyle}>
            <AccountMenu />
          </Box>
        </Box>
      </Box>
      <Box component="main" id={MAIN_ID} tabIndex={-1} sx={mainStyle}>
        <Box sx={contentStyle}>{children}</Box>
      </Box>
      <MobileNav />
    </Box>
  );
}
