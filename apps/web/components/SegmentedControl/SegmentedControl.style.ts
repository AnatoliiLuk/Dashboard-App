import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const rowStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  gap: spacingPx[8],
  mb: spacingPx[16],
  maxWidth: '100%',
  minWidth: 0,
});

export const labelStyle = ({ vars, typography }: Theme) => ({
  flexShrink: 0,
  color: vars.palette.text.secondary,
  fontFamily: typography.body1.fontFamily,
  fontSize: typography.body1.fontSize,
  fontWeight: typography.fontWeightMedium,
  lineHeight: 1,
});

export const optionsScrollStyle = {
  minWidth: 0,
  overflowX: 'auto' as const,
  overflowY: 'hidden' as const,
};

export const optionsStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
}: Theme) => ({
  display: 'flex',
  alignItems: 'stretch',
  boxSizing: 'border-box' as const,
  width: 'fit-content',
  minHeight: spacingPx[44],
  gap: spacingPx[4],
  p: spacingPx[0],
  border: border[1],
  borderColor: vars.palette.divider,
  borderRadius: borderRadius.pill,
  backgroundColor: vars.palette.background.paper,
});

export const optionStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
  typography,
}: Theme) => ({
  display: 'inline-flex' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  flexShrink: 0,
  boxSizing: 'border-box' as const,
  minWidth: spacingPx[44],
  minHeight: spacingPx[44],
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
  whiteSpace: 'nowrap' as const,
  cursor: 'pointer' as const,
  '&:hover': {
    color: vars.palette.text.primary,
  },
  '&:focus-visible': {
    outline: `${border[2]} ${vars.palette.text.primary}`,
    outlineOffset: spacingPx[4],
  },
});

export const optionActiveStyle = ({ vars }: Theme) => ({
  backgroundColor: vars.palette.text.primary,
  color: vars.palette.background.paper,
  '&:hover': {
    color: vars.palette.background.paper,
  },
});
