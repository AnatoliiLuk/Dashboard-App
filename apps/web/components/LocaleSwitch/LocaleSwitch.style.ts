import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const localeGroupStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
}: Theme) => ({
  display: 'flex' as const,
  alignItems: 'stretch' as const,
  boxSizing: 'border-box' as const,
  height: spacingPx[40],
  gap: spacingPx[4],
  p: spacingPx[4],
  border: border[1],
  borderColor: vars.palette.divider,
  borderRadius: borderRadius.pill,
  backgroundColor: vars.palette.background.paper,
});

export const localeButtonStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
  typography,
}: Theme) => ({
  display: 'inline-flex' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  px: spacingPx[12],
  py: spacingPx[0],
  border: 'none' as const,
  backgroundColor: 'transparent',
  borderRadius: borderRadius.pill,
  color: vars.palette.text.secondary,
  fontFamily: typography.button.fontFamily,
  fontSize: typography.button.fontSize,
  fontWeight: typography.button.fontWeight,
  lineHeight: typography.button.lineHeight,
  cursor: 'pointer' as const,
  '&:hover': {
    color: vars.palette.text.primary,
  },
  '&:focus-visible': {
    outline: `${border[2]} ${vars.palette.text.primary}`,
    outlineOffset: spacingPx[4],
  },
});

export const localeButtonActiveStyle = ({ vars }: Theme) => ({
  backgroundColor: vars.palette.text.primary,
  color: vars.palette.background.paper,
  '&:hover': {
    color: vars.palette.background.paper,
  },
});
