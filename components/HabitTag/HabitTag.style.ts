import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

import { habitColor, type HabitColor } from '@/lib/habits/colors';

export const habitTagStyle =
  (color: HabitColor) =>
  ({ spacingPx, borderRadius, typography }: Theme) => {
    const swatch = habitColor(color);

    return {
      display: 'inline-block',
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      px: spacingPx[8],
      py: spacingPx[4],
      borderRadius: borderRadius.pill,
      backgroundColor: swatch.background,
      color: swatch.text,
      fontSize: typography.body2.fontSize,
      lineHeight: typography.body2.lineHeight,
      fontWeight: typography.fontWeightMedium,
    };
  };
