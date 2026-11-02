import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const sectionStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: spacingPx[16],
  maxWidth: 480,
});

export const actionsStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  gap: spacingPx[16],
});
