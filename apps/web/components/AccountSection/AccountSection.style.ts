import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const cardStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
  breakpoints,
}: Theme) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
  gap: spacingPx[24],
  p: spacingPx[24],
  border: border[1],
  borderColor: vars.palette.divider,
  borderRadius: borderRadius.md,
  backgroundColor: vars.palette.background.paper,
  [breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: spacingPx[16],
  },
  [breakpoints.down('sm')]: {
    p: spacingPx[16],
  },
});

export const dangerCardStyle = ({ vars }: Theme) => ({
  borderColor: vars.palette.error.main,
});

export const introStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: spacingPx[4],
});

export const titleStyle = ({ spacingPx }: Theme) => ({
  m: spacingPx[0],
});

export const descriptionStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});

// Keeps fields a readable width when the card is wide.
export const controlsStyle = () => ({
  minWidth: 0,
  maxWidth: 480,
});
