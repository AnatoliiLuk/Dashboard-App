'use client';

import { createTheme } from '@mui/material/styles';

const fontFamily = 'var(--font-geist-sans), Arial, Helvetica, sans-serif';

const pxToRem = (value: number) =>
  `${Math.round((value / 16) * 1000) / 1000}rem`;

const spacingPx = {
  0: pxToRem(0),
  4: pxToRem(4),
  6: pxToRem(6),
  8: pxToRem(8),
  12: pxToRem(12),
  16: pxToRem(16),
  20: pxToRem(20),
  24: pxToRem(24),
  32: pxToRem(32),
  48: pxToRem(48),
  576: pxToRem(576),
  768: pxToRem(768),
} as const;

const borderRadius = {
  none: pxToRem(0),
  xs: pxToRem(8),
  sm: pxToRem(12),
  md: pxToRem(16),
  lg: pxToRem(24),
  pill: pxToRem(999),
} as const;

const border = {
  0: 'none',
  1: '1px solid',
  2: '2px solid',
} as const;

type SpacingPx = typeof spacingPx;
type BorderRadius = typeof borderRadius;
type Border = typeof border;

declare module '@mui/material/styles' {
  interface Theme {
    spacingPx: SpacingPx;
    borderRadius: BorderRadius;
    border: Border;
    pxToRem: (value: number) => string;
  }

  interface ThemeOptions {
    spacingPx?: SpacingPx;
    borderRadius?: BorderRadius;
    border?: Border;
    pxToRem?: (value: number) => string;
  }
}

const type = (
  size: number,
  fontWeight: number,
  lineHeight: number,
) => ({
  fontFamily,
  fontWeight,
  fontSize: pxToRem(size),
  lineHeight,
});

export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-mui-color-scheme',
  },
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
  spacingPx,
  borderRadius,
  border,
  pxToRem,
  typography: {
    fontFamily,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: type(36, 400, 1.167),
    h2: type(32, 400, 1.2),
    h3: type(28, 400, 1.167),
    h4: type(34, 400, 1.235),
    h5: type(24, 400, 1.334),
    h6: type(20, 500, 1.6),
    body1: type(16, 400, 1.5),
    body2: type(14, 400, 1.43),
    button: type(14, 500, 1.25),
  },
  shape: {
    borderRadius: 16,
  },
});
