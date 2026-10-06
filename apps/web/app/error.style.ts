import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const retryStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
  typography,
}: Theme) => ({
  boxSizing: 'border-box' as const,
  display: 'inline-flex' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  height: spacingPx[40],
  border: border[1],
  borderColor: vars.palette.divider,
  backgroundColor: vars.palette.background.paper,
  color: vars.palette.text.primary,
  borderRadius: borderRadius.pill,
  px: spacingPx[12],
  py: spacingPx[0],
  fontFamily: typography.button.fontFamily,
  fontSize: typography.button.fontSize,
  fontWeight: typography.button.fontWeight,
  lineHeight: typography.button.lineHeight,
  cursor: 'pointer' as const,
});
