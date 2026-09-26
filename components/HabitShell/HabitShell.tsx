'use client';

import { Box, Link, Typography } from '@mui/material';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { ThemeToggle } from '@/components/ThemeToggle';

import { mainStyle, pageStyle } from '@/app/page.style';

import {
  barStartStyle,
  barStyle,
  brandStyle,
  descriptionStyle,
  headerStyle,
  menuItemActiveStyle,
  menuItemStyle,
  menuStyle,
} from './HabitShell.style';

const menu = [
  { href: '/', label: 'Calendar' },
  { href: '/log', label: 'Log habits' },
] as const;

type HabitShellProps = {
  description: string;
  children: ReactNode;
};

export function HabitShell({ description, children }: HabitShellProps) {
  const pathname = usePathname();

  return (
    <Box sx={pageStyle}>
      <Box component="main" sx={mainStyle}>
        <Box component="header" sx={headerStyle}>
          <Box sx={barStyle}>
            <Box sx={barStartStyle}>
              <Typography variant="h1" component="h1" sx={brandStyle}>
                Habits+
              </Typography>
              <Box component="nav" sx={menuStyle} aria-label="Menu">
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
                      {label}
                    </Link>
                  );
                })}
              </Box>
            </Box>
            <ThemeToggle />
          </Box>
          <Typography sx={descriptionStyle}>{description}</Typography>
        </Box>
        {children}
      </Box>
    </Box>
  );
}
