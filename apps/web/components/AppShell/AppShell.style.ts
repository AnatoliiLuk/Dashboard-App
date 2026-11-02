import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

// Hidden on screen, still read by assistive tech.
const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  m: '-1px',
  p: 0,
  border: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;

// Room the fixed mobile tab bar takes, so the page can scroll past it.
export const MOBILE_NAV_HEIGHT = 64;

export const shellStyle = ({ vars }: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100dvh',
  backgroundColor: vars.palette.background.default,
  color: vars.palette.text.primary,
});

export const skipLinkStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
  zIndex,
}: Theme) => ({
  ...visuallyHidden,
  '&:focus': {
    position: 'fixed',
    top: spacingPx[8],
    left: spacingPx[8],
    zIndex: zIndex.tooltip,
    width: 'auto',
    height: 'auto',
    m: 0,
    overflow: 'visible',
    clip: 'auto',
    px: spacingPx[16],
    py: spacingPx[12],
    borderRadius: borderRadius.pill,
    backgroundColor: vars.palette.text.primary,
    color: vars.palette.background.paper,
    outline: `${border[2]} ${vars.palette.text.primary}`,
    outlineOffset: spacingPx[4],
  },
});

export const headerStyle = ({ vars, spacingPx, border, zIndex }: Theme) => ({
  position: 'sticky',
  top: 0,
  zIndex: zIndex.appBar,
  px: { xs: spacingPx[16], sm: spacingPx[24] },
  py: { xs: spacingPx[8], md: spacingPx[12] },
  borderBottom: border[1],
  borderBottomColor: vars.palette.divider,
  backgroundColor: vars.palette.background.default,
});

export const headerInnerStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  gap: spacingPx[16],
  width: '100%',
  maxWidth: '60rem',
  mx: 'auto',
});

export const brandStyle = ({ vars, typography, border, spacingPx }: Theme) => ({
  ...typography.h5,
  fontWeight: typography.fontWeightMedium,
  color: vars.palette.text.primary,
  whiteSpace: 'nowrap',
  '&:focus-visible': {
    outline: `${border[2]} ${vars.palette.text.primary}`,
    outlineOffset: spacingPx[4],
  },
});

export const headerEndStyle = () => ({
  display: 'flex',
  alignItems: 'center',
  ml: 'auto',
});

export const mainStyle = ({ spacingPx }: Theme) => ({
  flex: 1,
  px: { xs: spacingPx[16], sm: spacingPx[24] },
  pt: { xs: spacingPx[24], md: spacingPx[48] },
  pb: {
    xs: `calc(${MOBILE_NAV_HEIGHT}px + env(safe-area-inset-bottom) + ${spacingPx[24]})`,
    md: spacingPx[48],
  },
  '&:focus': {
    outline: 'none',
  },
});

export const contentStyle = () => ({
  width: '100%',
  maxWidth: '60rem',
  mx: 'auto',
});

export const pageTitleStyle = () => visuallyHidden;

// Used by AuthLayout, which keeps the original single-row bar.
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

export const barEndStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: spacingPx[12],
});

export const menuStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
}: Theme) => ({
  display: { xs: 'none', md: 'flex' },
  alignItems: 'stretch' as const,
  boxSizing: 'border-box' as const,
  gap: spacingPx[2],
  p: spacingPx[2],
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
  boxSizing: 'border-box' as const,
  flexShrink: 0,
  whiteSpace: 'nowrap' as const,
  minWidth: spacingPx[44],
  minHeight: spacingPx[44],
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
