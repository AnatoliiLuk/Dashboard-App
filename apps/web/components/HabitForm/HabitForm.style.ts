import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const formStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: spacingPx[16],
  mb: spacingPx[24],
});

export const fieldsStyle = ({ spacingPx, breakpoints }: Theme) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
  alignItems: 'flex-start',
  gap: spacingPx[16],
  [breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
});

export const colorFieldStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  minWidth: 0,
  minHeight: spacingPx[40],
});

export const editingStyle = ({ typography }: Theme) => ({
  fontWeight: typography.fontWeightMedium,
});

export const actionsStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: spacingPx[8],
});
