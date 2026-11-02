import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const rowStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: spacingPx[8],
  mb: spacingPx[16],
  maxWidth: '100%',
  minWidth: 0,
});

// Phones name the picker through its icon; screen readers still get the label.
export const labelStyle = ({ vars, typography, breakpoints }: Theme) => ({
  flexShrink: 0,
  color: vars.palette.text.secondary,
  fontFamily: typography.body1.fontFamily,
  fontSize: typography.body1.fontSize,
  fontWeight: typography.fontWeightMedium,
  lineHeight: 1,
  [breakpoints.down('sm')]: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
  },
});

export const actionStyle = {
  flexShrink: 0,
  ml: 'auto',
};

export const optionsScrollStyle = {
  display: { xs: 'none', sm: 'block' },
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
  gap: spacingPx[2],
  p: spacingPx[2],
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

export const compactStyle = () => ({
  display: { xs: 'flex', sm: 'none' },
  position: 'relative' as const,
  alignItems: 'center' as const,
  minWidth: 0,
});

const compactIconBase = ({ vars }: Theme) => ({
  position: 'absolute' as const,
  top: '50%',
  display: 'inline-flex' as const,
  transform: 'translateY(-50%)',
  color: vars.palette.text.secondary,
  pointerEvents: 'none' as const,
});

export const compactIconStyle = (theme: Theme) => ({
  ...compactIconBase(theme),
  left: theme.spacingPx[16],
});

export const chevronStyle = (theme: Theme) => ({
  ...compactIconBase(theme),
  right: theme.spacingPx[16],
});

export const selectStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
  typography,
}: Theme) => ({
  appearance: 'none' as const,
  boxSizing: 'border-box' as const,
  maxWidth: '100%',
  minHeight: spacingPx[44],
  m: spacingPx[0],
  pl: spacingPx[16],
  pr: spacingPx[40],
  border: border[1],
  borderColor: vars.palette.divider,
  borderRadius: borderRadius.pill,
  backgroundColor: vars.palette.background.paper,
  color: vars.palette.text.primary,
  fontFamily: typography.button.fontFamily,
  fontSize: typography.button.fontSize,
  fontWeight: typography.button.fontWeight,
  textOverflow: 'ellipsis',
  cursor: 'pointer' as const,
  '&:focus-visible': {
    outline: `${border[2]} ${vars.palette.text.primary}`,
    outlineOffset: spacingPx[4],
  },
});

export const selectWithIconStyle = ({ spacingPx }: Theme) => ({
  pl: spacingPx[40],
});
