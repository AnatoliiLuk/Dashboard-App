import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const groupStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
}: Theme) => ({
  display: 'flex' as const,
  alignItems: 'stretch' as const,
  boxSizing: 'border-box' as const,
  gap: spacingPx[2],
  p: spacingPx[2],
  border: border[1],
  borderColor: vars.palette.divider,
  borderRadius: borderRadius.pill,
  backgroundColor: vars.palette.background.paper,
});

export const buttonStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
}: Theme) => ({
  display: 'inline-flex' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  boxSizing: 'border-box' as const,
  width: spacingPx[44],
  height: spacingPx[44],
  minWidth: spacingPx[44],
  minHeight: spacingPx[44],
  p: spacingPx[0],
  border: 'none' as const,
  backgroundColor: 'transparent',
  borderRadius: borderRadius.pill,
  color: vars.palette.text.secondary,
  cursor: 'pointer' as const,
  '& svg': {
    display: 'block' as const,
  },
  '&:hover': {
    color: vars.palette.text.primary,
  },
  '&:focus-visible': {
    outline: `${border[2]} ${vars.palette.text.primary}`,
    outlineOffset: spacingPx[4],
  },
});

export const buttonActiveStyle = ({ vars }: Theme) => ({
  backgroundColor: vars.palette.text.primary,
  color: vars.palette.background.paper,
  '&:hover': {
    color: vars.palette.background.paper,
  },
});
