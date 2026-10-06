import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const headerStyle = ({ spacingPx }: Theme) => ({
  mb: spacingPx[32],
});

export const barStyle = ({ vars, spacingPx, border }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: spacingPx[16],
  pb: spacingPx[16],
  borderBottom: border[1],
  borderBottomColor: vars.palette.divider,
});

export const barStartStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: spacingPx[16],
});

export const barEndStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  gap: spacingPx[12],
});

export const brandStyle = ({ spacingPx }: Theme) => ({
  m: spacingPx[0],
});

export const menuStyle = ({
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

export const menuItemStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
  typography,
}: Theme) => ({
  display: 'inline-flex' as const,
  alignItems: 'center' as const,
  px: spacingPx[12],
  py: spacingPx[0],
  borderRadius: borderRadius.pill,
  color: vars.palette.text.secondary,
  textDecoration: 'none' as const,
  fontFamily: typography.button.fontFamily,
  fontSize: typography.button.fontSize,
  fontWeight: typography.button.fontWeight,
  lineHeight: typography.button.lineHeight,
  '&:hover': {
    color: vars.palette.text.primary,
  },
  '&:focus-visible': {
    outline: `${border[2]} ${vars.palette.text.primary}`,
    outlineOffset: spacingPx[4],
  },
});

export const menuItemActiveStyle = ({ vars }: Theme) => ({
  backgroundColor: vars.palette.text.primary,
  color: vars.palette.background.paper,
  '&:hover': {
    color: vars.palette.background.paper,
  },
});

export const descriptionStyle = ({ vars, spacingPx }: Theme) => ({
  mt: spacingPx[16],
  maxWidth: spacingPx[576],
  color: vars.palette.text.secondary,
});
