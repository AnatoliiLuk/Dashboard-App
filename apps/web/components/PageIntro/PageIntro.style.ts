import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const introStyle = ({ spacingPx, breakpoints }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: spacingPx[16],
  mb: spacingPx[32],
  [breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
});

export const descriptionStyle = ({ vars, spacingPx }: Theme) => ({
  flex: '0 1 auto',
  maxWidth: spacingPx[576],
  m: spacingPx[0],
  color: vars.palette.text.secondary,
});

export const actionStyle = () => ({
  flexShrink: 0,
  whiteSpace: 'nowrap',
});
