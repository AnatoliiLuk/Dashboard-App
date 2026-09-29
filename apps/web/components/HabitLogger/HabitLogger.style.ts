import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const listStyle = ({ spacingPx }: Theme) => ({
  display: 'grid',
  gap: spacingPx[16],
  p: spacingPx[0],
  m: spacingPx[0],
  listStyle: 'none',
});

export const emptyStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});
