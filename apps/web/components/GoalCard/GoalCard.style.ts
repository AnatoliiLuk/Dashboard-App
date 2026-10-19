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

export const titleStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'baseline',
  flexWrap: 'wrap',
  gap: spacingPx[8],
  minWidth: 0,
  flex: 1,
});

export const nameStyle = {
  minWidth: 0,
};

export const statusStyle = ({ vars, typography }: Theme) => ({
  color: vars.palette.text.secondary,
  fontWeight: typography.fontWeightMedium,
});

export const actionsStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  gap: spacingPx[8],
});

export const selectedGoalStyle = ({ vars }: Theme) => ({
  borderColor: vars.palette.primary.main,
});

export const rangeStyle = ({ vars }: Theme) => ({
  flexShrink: 0,
  color: vars.palette.text.secondary,
});

export const footerStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  mt: spacingPx[16],
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
  mt: spacingPx[12],
});

export const progressTrackStyle = ({ spacingPx }: Theme) => ({
  position: 'relative' as const,
  width: '100%',
  pb: spacingPx[24],
});

export const progressStyle =
  (color: GoalColor) =>
  ({ spacingPx, borderRadius }: Theme) => {
    const swatch = goalColor(color);

    return {
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

export const percentStyle =
  (percent: number) =>
  ({ vars, spacingPx, typography }: Theme) => {
    let translate = 'translateX(-50%)';
    if (percent <= 0) {
      translate = 'translateX(0)';
    } else if (percent >= 100) {
      translate = 'translateX(-100%)';
    }

    return {
      position: 'absolute' as const,
      top: spacingPx[12],
      left: `${percent}%`,
      transform: translate,
      color: vars.palette.text.secondary,
      fontWeight: typography.fontWeightMedium,
      whiteSpace: 'nowrap' as const,
    };
  };

export const chartLabelStyle = ({ vars, spacingPx }: Theme) => ({
  mt: spacingPx[16],
  color: vars.palette.text.secondary,
});

export const chartStyle = {
  width: '100%',
};
