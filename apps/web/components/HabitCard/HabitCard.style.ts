import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

import type { HabitStatus } from './HabitCard.interface';

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
  flexWrap: 'wrap',
  gap: spacingPx[16],
});

export const habitNameStyle = {
  minWidth: 0,
  flex: 1,
};

export const actionsStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  gap: spacingPx[8],
});

export const editFieldStyle = {
  flex: 1,
  minWidth: 0,
};

export const deleteStyle = ({ vars }: Theme) => ({
  color: vars.palette.error.main,
  borderColor: vars.palette.error.main,
});

export const habitColorStyle = ({ spacingPx }: Theme) => ({
  mt: spacingPx[12],
});

export const messageStyle =
  (status: HabitStatus) =>
  ({ vars, spacingPx }: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacingPx[8],
    mt: spacingPx[8],
    color: vars.palette[status].main,
    '& svg': {
      flexShrink: 0,
    },
  });

export const footerStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: spacingPx[16],
  mt: spacingPx[16],
});

export const daysStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  gap: spacingPx[8],
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

export const toggleStyle = ({
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
  flexShrink: 0,
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
