import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const contentStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: spacingPx[16],
});

export const scopeListStyle = ({ spacingPx }: Theme) => ({
  m: 0,
  pl: spacingPx[24],
  display: 'flex',
  flexDirection: 'column',
  gap: spacingPx[4],
});

export const actionsStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: spacingPx[12],
});
