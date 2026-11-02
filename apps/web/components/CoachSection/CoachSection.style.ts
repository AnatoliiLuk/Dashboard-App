import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const sectionStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: spacingPx[16],
  maxWidth: 480,
});

export const usageStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: spacingPx[8],
});

export const secondaryTextStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});

export const actionsStyle = ({ vars, spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: spacingPx[8],
  color: vars.palette.text.secondary,
});
