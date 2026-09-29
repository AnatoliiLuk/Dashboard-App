'use client';

import { createTheme } from '@mui/material/styles';

import { colors, type Colors } from '@/lib/colors';

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
    colors: Colors;
    spacingPx: SpacingPx;
    borderRadius: BorderRadius;
    border: Border;
    pxToRem: (value: number) => string;
  }

  interface ThemeOptions {
    colors?: Colors;
    spacingPx?: SpacingPx;
    borderRadius?: BorderRadius;
    border?: Border;
    pxToRem?: (value: number) => string;
  }
}

const type = (size: number, fontWeight: number, lineHeight: number) => ({
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
        background: { default: colors.zinc100, paper: colors.white },
        text: { primary: colors.zinc900, secondary: colors.zinc500 },
        divider: colors.zinc200,
        success: { main: colors.green700 },
        warning: { main: colors.amber700 },
        info: { main: colors.sky700 },
        error: { main: colors.red700, light: colors.red50 },
      },
    },
    dark: {
      palette: {
        background: { default: colors.zinc950, paper: colors.zinc900 },
        text: { primary: colors.zinc50, secondary: colors.zinc400 },
        divider: colors.zinc800,
        success: { main: colors.green400 },
        warning: { main: colors.amber400 },
        info: { main: colors.sky400 },
        error: { main: colors.red300, light: colors.red950 },
      },
    },
  },
  colors,
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
