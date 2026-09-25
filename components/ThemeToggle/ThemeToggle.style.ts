import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const themeToggleStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
  typography,
}: Theme) => ({
  flexShrink: 0,
  border: border[1],
  borderColor: vars.palette.divider,
  backgroundColor: vars.palette.background.paper,
  color: vars.palette.text.secondary,
  borderRadius: borderRadius.pill,
  px: spacingPx[12],
  py: spacingPx[6],
  fontFamily: typography.button.fontFamily,
  fontSize: typography.button.fontSize,
  fontWeight: typography.button.fontWeight,
  lineHeight: typography.button.lineHeight,
  cursor: 'pointer',
  '&:hover': {
    color: vars.palette.text.primary,
    backgroundColor: vars.palette.action.hover,
  },
});
