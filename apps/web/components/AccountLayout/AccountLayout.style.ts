import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

// Tabs on the left from md up; a row above the content below that.
export const layoutStyle = ({ spacingPx, breakpoints }: Theme) => ({
  display: 'grid',
  gridTemplateColumns: '12rem minmax(0, 1fr)',
  alignItems: 'start',
  gap: spacingPx[32],
  [breakpoints.down('md')]: {
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: spacingPx[16],
  },
});

export const navStyle = ({ spacingPx, breakpoints }: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: spacingPx[4],
  [breakpoints.down('md')]: {
    flexDirection: 'row',
    overflowX: 'auto',
  },
});

export const tabStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
  typography,
}: Theme) => ({
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  whiteSpace: 'nowrap',
  minHeight: spacingPx[44],
  px: spacingPx[16],
  borderRadius: borderRadius.pill,
  color: vars.palette.text.secondary,
  fontFamily: typography.button.fontFamily,
  fontSize: typography.button.fontSize,
  fontWeight: typography.button.fontWeight,
  '&:hover': {
    color: vars.palette.text.primary,
  },
  '&:focus-visible': {
    outline: `${border[2]} ${vars.palette.text.primary}`,
    outlineOffset: spacingPx[2],
  },
});

// Same colours as the active item in the main navigation (AppShell).
export const tabActiveStyle = ({ vars }: Theme) => ({
  backgroundColor: vars.palette.text.primary,
  color: vars.palette.background.paper,
  '&:hover': {
    color: vars.palette.background.paper,
  },
});

export const tabBadgeStyle = ({ spacingPx }: Theme) => ({
  ml: spacingPx[6],
});

export const sectionsStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: spacingPx[24],
});
