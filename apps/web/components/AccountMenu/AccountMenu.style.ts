import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const triggerStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
  typography,
}: Theme) => ({
  width: spacingPx[44],
  height: spacingPx[44],
  border: border[1],
  borderColor: vars.palette.divider,
  borderRadius: borderRadius.pill,
  backgroundColor: vars.palette.background.paper,
  color: vars.palette.text.primary,
  fontFamily: typography.button.fontFamily,
  fontSize: typography.button.fontSize,
  fontWeight: typography.button.fontWeight,
  '&:focus-visible': {
    outline: `${border[2]} ${vars.palette.text.primary}`,
    outlineOffset: spacingPx[4],
  },
});

export const triggerActiveStyle = ({ vars }: Theme) => ({
  borderColor: vars.palette.text.primary,
  backgroundColor: vars.palette.text.primary,
  color: vars.palette.background.paper,
  '&:hover': {
    backgroundColor: vars.palette.text.primary,
  },
});

export const placeholderStyle = ({ spacingPx }: Theme) => ({
  width: spacingPx[44],
  height: spacingPx[44],
});

export const paperStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
}: Theme) => ({
  width: `min(20rem, calc(100vw - ${spacingPx[32]}))`,
  mt: spacingPx[8],
  py: spacingPx[8],
  border: border[1],
  borderColor: vars.palette.divider,
  borderRadius: borderRadius.md,
  backgroundImage: 'none',
});

export const identityStyle = ({ spacingPx }: Theme) => ({
  px: spacingPx[16],
  py: spacingPx[8],
});

export const nameStyle = ({ typography }: Theme) => ({
  fontWeight: typography.fontWeightMedium,
});

export const emailStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});

export const dividerStyle = ({ spacingPx }: Theme) => ({
  my: spacingPx[8],
});

export const rowStyle = ({ vars, spacingPx, border, typography }: Theme) => ({
  display: 'flex' as const,
  alignItems: 'center' as const,
  gap: spacingPx[12],
  boxSizing: 'border-box' as const,
  width: '100%',
  minHeight: spacingPx[44],
  px: spacingPx[16],
  py: spacingPx[0],
  border: 'none' as const,
  backgroundColor: 'transparent',
  color: vars.palette.text.primary,
  textAlign: 'left' as const,
  textDecoration: 'none' as const,
  fontFamily: typography.body1.fontFamily,
  fontSize: typography.body1.fontSize,
  cursor: 'pointer' as const,
  '&:hover': {
    backgroundColor: vars.palette.action.hover,
  },
  '&:focus-visible': {
    outline: `${border[2]} ${vars.palette.text.primary}`,
    outlineOffset: `-${spacingPx[2]}`,
  },
});

export const rowActiveStyle = ({ typography }: Theme) => ({
  fontWeight: typography.fontWeightMedium,
});

export const settingStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: spacingPx[16],
  px: spacingPx[16],
  py: spacingPx[4],
});

export const settingLabelStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});
