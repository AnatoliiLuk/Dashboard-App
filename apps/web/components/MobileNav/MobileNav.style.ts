import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

import { MOBILE_NAV_HEIGHT } from '@/components/AppShell/AppShell.style';

export const navStyle = ({ vars, border, zIndex }: Theme) => ({
  display: { xs: 'flex', md: 'none' },
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: zIndex.appBar,
  pb: 'env(safe-area-inset-bottom)',
  borderTop: border[1],
  borderTopColor: vars.palette.divider,
  backgroundColor: vars.palette.background.paper,
});

export const itemStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
  typography,
}: Theme) => ({
  flex: 1,
  display: 'flex' as const,
  flexDirection: 'column' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: spacingPx[4],
  minWidth: 0,
  height: `${MOBILE_NAV_HEIGHT}px`,
  color: vars.palette.text.secondary,
  textDecoration: 'none' as const,
  fontFamily: typography.button.fontFamily,
  fontSize: typography.pxToRem(12),
  fontWeight: typography.button.fontWeight,
  lineHeight: 1.2,
  '&:focus-visible': {
    outline: `${border[2]} ${vars.palette.text.primary}`,
    outlineOffset: `-${spacingPx[4]}`,
    borderRadius: borderRadius.sm,
  },
});

export const itemActiveStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.primary,
});

// A pill behind the icon marks the current tab, not just a colour change.
export const iconStyle = ({ spacingPx, borderRadius }: Theme) => ({
  position: 'relative' as const,
  display: 'inline-flex' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  width: spacingPx[48],
  height: spacingPx[24],
  borderRadius: borderRadius.pill,
});

export const iconActiveStyle = ({ vars }: Theme) => ({
  backgroundColor: vars.palette.text.primary,
  color: vars.palette.background.paper,
});

export const labelStyle = () => ({
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
});

// Sits on the icon pill's top-right corner, so the label keeps its width.
export const badgeStyle = ({ spacingPx }: Theme) => ({
  position: 'absolute' as const,
  top: `-${spacingPx[6]}`,
  right: `-${spacingPx[8]}`,
});
