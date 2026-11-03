'use client';

import { Box, Link } from '@mui/material';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

import { isCurrentRoute, menu } from '@/components/AppShell/AppShell.constants';
import { useTranslation } from '@/lib/i18n';

import {
  iconActiveStyle,
  iconStyle,
  itemActiveStyle,
  itemStyle,
  labelStyle,
  navStyle,
} from './MobileNav.style';

// Bottom tab bar for phones and small tablets, within thumb reach.
export function MobileNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <Box component="nav" aria-label={t('shell.menu')} sx={navStyle}>
      {menu.map(({ href, shortLabel, Icon }) => {
        const current = isCurrentRoute(pathname, href);
        return (
          <Link
            key={href}
            component={NextLink}
            href={href}
            underline="none"
            aria-current={current ? 'page' : undefined}
            sx={[itemStyle, current ? itemActiveStyle : null]}
          >
            <Box
              component="span"
              sx={[iconStyle, current ? iconActiveStyle : null]}
            >
              <Icon width={18} height={18} />
            </Box>
            <Box component="span" sx={labelStyle}>
              {t(shortLabel)}
            </Box>
          </Link>
        );
      })}
    </Box>
  );
}
