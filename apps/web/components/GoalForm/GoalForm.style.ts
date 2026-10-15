import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const formStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: spacingPx[16],
  mb: spacingPx[24],
});

export const datesStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: spacingPx[8],
});

export const noteStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});

export const editingStyle = ({ typography }: Theme) => ({
  fontWeight: typography.fontWeightMedium,
});

export const actionsStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: spacingPx[8],
});
