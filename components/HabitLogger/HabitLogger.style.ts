import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const formStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  gap: spacingPx[8],
  mb: spacingPx[24],
});

export const nameFieldStyle = {
  flex: 1,
};

export const listStyle = ({ spacingPx }: Theme) => ({
  display: 'grid',
  gap: spacingPx[16],
  p: spacingPx[0],
  m: spacingPx[0],
  listStyle: 'none',
});

export const habitStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
}: Theme) => ({
  border: border[1],
  borderColor: vars.palette.divider,
  backgroundColor: vars.palette.background.paper,
  borderRadius: borderRadius.md,
  p: spacingPx[20],
});

export const habitTopStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: spacingPx[16],
});

export const habitNameStyle = ({ typography }: Theme) => ({
  fontWeight: typography.fontWeightMedium,
});

export const messageStyle = ({ vars, spacingPx }: Theme) => ({
  mt: spacingPx[8],
  color: vars.palette.text.secondary,
});

export const daysStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  gap: spacingPx[8],
  mt: spacingPx[16],
});

export const dayStyle = ({ vars, borderRadius }: Theme) => ({
  width: 12,
  height: 12,
  borderRadius: borderRadius.pill,
  backgroundColor: vars.palette.divider,
});

export const dayDoneStyle = ({ vars, borderRadius }: Theme) => ({
  width: 12,
  height: 12,
  borderRadius: borderRadius.pill,
  backgroundColor: vars.palette.text.primary,
});

export const emptyStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});

export const toggleStyle = ({
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
  color: vars.palette.text.primary,
  borderRadius: borderRadius.pill,
  px: spacingPx[12],
  py: spacingPx[6],
  fontFamily: typography.button.fontFamily,
  fontSize: typography.button.fontSize,
  fontWeight: typography.button.fontWeight,
  lineHeight: typography.button.lineHeight,
  cursor: 'pointer',
});
