import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const sectionStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: spacingPx[16],
  maxWidth: 480,
});

export const descriptionStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});

export const dialogContentStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: spacingPx[16],
});
