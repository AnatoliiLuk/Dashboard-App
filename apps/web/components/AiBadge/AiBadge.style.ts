import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

// The one accent colour in a monochrome UI. A solid fill keeps it readable
// on any surface, including the inverted active nav pill.
export const badgeStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
  typography,
}: Theme) => ({
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  height: spacingPx[16],
  px: spacingPx[6],
  border: border[1],
  borderColor: vars.palette.info.main,
  borderRadius: borderRadius.pill,
  backgroundColor: `color-mix(in srgb, ${vars.palette.info.main} 12%, ${vars.palette.background.paper})`,
  color: vars.palette.info.main,
  fontFamily: typography.fontFamily,
  fontSize: typography.pxToRem(10),
  fontWeight: typography.fontWeightBold,
  letterSpacing: '0.04em',
  lineHeight: 1,
});
