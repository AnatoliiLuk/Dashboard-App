import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const pageStyle = ({ vars, spacingPx }: Theme) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: vars.palette.background.default,
  color: vars.palette.text.primary,
  px: spacingPx[24],
  py: spacingPx[48],
});

export const mainStyle = () => ({
  width: '100%',
  maxWidth: '60rem',
});

export const loadingStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});
