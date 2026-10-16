import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const formStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: spacingPx[16],
  mb: spacingPx[48],
});

export const nameRowStyle = ({ spacingPx, breakpoints }: Theme) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  alignItems: 'flex-start',
  gap: spacingPx[16],
  [breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
});

export const detailsRowStyle = ({ spacingPx, breakpoints }: Theme) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
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
  minHeight: spacingPx[44],
});

export const noteStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});

export const editingStyle = ({ typography }: Theme) => ({
  fontWeight: typography.fontWeightMedium,
});

export const actionsStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  minWidth: 0,
  minHeight: spacingPx[44],
  gap: spacingPx[8],
  '& > *': {
    flex: '1 1 0',
    minWidth: spacingPx[44],
    minHeight: spacingPx[44],
  },
});
