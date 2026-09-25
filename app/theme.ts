'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        background: { default: '#f4f4f5', paper: '#ffffff' },
        text: { primary: '#18181b', secondary: '#71717a' },
        divider: '#e4e4e7',
        error: { main: '#b91c1c', light: '#fef2f2' },
      },
    },
    dark: {
      palette: {
        background: { default: '#09090b', paper: '#18181b' },
        text: { primary: '#fafafa', secondary: '#a1a1aa' },
        divider: '#27272a',
        error: { main: '#fca5a5', light: '#450a0a' },
      },
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), Arial, Helvetica, sans-serif',
  },
  shape: {
    borderRadius: 16,
  },
});
