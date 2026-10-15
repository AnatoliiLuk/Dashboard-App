import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

import { goalColor, type GoalColor } from '@/lib/goals/colors';

export const goalStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
}: Theme) => ({
  display: 'flex',
  alignItems: 'stretch',
  overflow: 'hidden',
  border: border[1],
  borderColor: vars.palette.divider,
  backgroundColor: vars.palette.background.paper,
  borderRadius: borderRadius.md,
  p: spacingPx[0],
});

export const bandStyle =
  (color: GoalColor) =>
  ({ spacingPx }: Theme) => ({
    width: spacingPx[8],
    flexShrink: 0,
    backgroundColor: goalColor(color).bar,
  });

export const bodyStyle = ({ spacingPx }: Theme) => ({
  flex: 1,
  minWidth: 0,
  p: spacingPx[20],
});

export const topStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: spacingPx[16],
});

export const nameStyle = {
  minWidth: 0,
  flex: 1,
};

export const actionsStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  gap: spacingPx[8],
});

export const selectedGoalStyle = ({ vars }: Theme) => ({
  borderColor: vars.palette.primary.main,
});

export const rangeStyle = ({ vars, spacingPx }: Theme) => ({
  mt: spacingPx[8],
  color: vars.palette.text.secondary,
});

export const spanStyle = ({ vars, spacingPx }: Theme) => ({
  mt: spacingPx[4],
  color: vars.palette.text.secondary,
});

export const chipsStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: spacingPx[8],
  m: spacingPx[0],
  mt: spacingPx[12],
  p: spacingPx[0],
  listStyle: 'none',
});

export const progressRowStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  gap: spacingPx[12],
  mt: spacingPx[16],
});

export const progressStyle =
  (color: GoalColor) =>
  ({ spacingPx, borderRadius }: Theme) => {
    const swatch = goalColor(color);

    return {
      flex: 1,
      height: spacingPx[8],
      overflow: 'hidden',
      borderRadius: borderRadius.pill,
      backgroundColor: swatch.background,
      '& .MuiLinearProgress-bar': {
        backgroundColor: swatch.bar,
        borderRadius: borderRadius.pill,
      },
    };
  };

export const percentStyle = ({ typography }: Theme) => ({
  flexShrink: 0,
  minWidth: '3rem',
  textAlign: 'right' as const,
  fontWeight: typography.fontWeightMedium,
});

export const deleteStyle = ({ vars }: Theme) => ({
  color: vars.palette.error.main,
  borderColor: vars.palette.error.main,
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
