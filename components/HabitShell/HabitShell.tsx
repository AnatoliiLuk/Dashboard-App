'use client';

import { Box, Link, Typography } from '@mui/material';
import NextLink from 'next/link';
import type { ReactNode } from 'react';

import { ThemeToggle } from '@/components/ThemeToggle';

import {
  descriptionStyle,
  headerStyle,
  headerTopStyle,
  mainStyle,
  navLinkStyle,
  navStyle,
  pageStyle,
  titleStyle,
} from '@/app/page.style';

type HabitShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function HabitShell({ title, description, children }: HabitShellProps) {
  return (
    <Box sx={pageStyle}>
      <Box component="main" sx={mainStyle}>
        <Box component="header" sx={headerStyle}>
          <Box sx={headerTopStyle}>
            <ThemeToggle />
          </Box>
          <Typography variant="h4" component="h1" sx={titleStyle}>
            {title}
          </Typography>
          <Typography sx={descriptionStyle}>{description}</Typography>
          <Box component="nav" sx={navStyle} aria-label="Sections">
            <Link component={NextLink} href="/" sx={navLinkStyle}>
              Calendar
            </Link>
            <Link component={NextLink} href="/log" sx={navLinkStyle}>
              Log habits
            </Link>
          </Box>
        </Box>
        {children}
      </Box>
    </Box>
  );
}
