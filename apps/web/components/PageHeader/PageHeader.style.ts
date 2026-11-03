import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

// One row: the page name on the left, its main action on the right.
export const headerStyle = ({ spacingPx, breakpoints }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: spacingPx[12],
  minHeight: spacingPx[44],
  mb: spacingPx[32],
  [breakpoints.down('sm')]: {
    mb: spacingPx[24],
  },
});

export const titleStyle = ({ spacingPx, typography, breakpoints }: Theme) => ({
  ...typography.h5,
  m: spacingPx[0],
  fontWeight: typography.fontWeightMedium,
  [breakpoints.down('sm')]: {
    fontSize: typography.h6.fontSize,
    lineHeight: typography.h6.lineHeight,
  },
});

export const actionStyle = () => ({
  flexShrink: 0,
  whiteSpace: 'nowrap',
});
