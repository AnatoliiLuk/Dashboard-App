'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { theme } from '@/app/theme';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme} defaultMode="system" disableTransitionOnChange>
        <CssBaseline />
        <SWRConfig
          value={{
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
          }}
        >
          {children}
        </SWRConfig>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
