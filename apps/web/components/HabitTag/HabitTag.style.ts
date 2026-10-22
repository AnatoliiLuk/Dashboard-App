import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

import { habitColor, type HabitColor } from '@/lib/habits/colors';

export const habitTagStyle =
  (color: HabitColor, wrap: boolean) =>
  ({ spacingPx, borderRadius, typography }: Theme) => {
    const swatch = habitColor(color);

    return {
      display: 'inline-block',
      maxWidth: '100%',
      boxSizing: 'border-box' as const,
      ...(wrap
        ? {
            whiteSpace: 'normal' as const,
            overflowWrap: 'anywhere' as const,
          }
        : {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap' as const,
          }),
      px: spacingPx[8],
      py: spacingPx[4],
      // A pill radius turns multi-line tags into a stadium; use a softer corner.
      borderRadius: wrap ? borderRadius.xs : borderRadius.pill,
      backgroundColor: swatch.background,
      color: swatch.text,
      fontSize: typography.body2.fontSize,
      lineHeight: typography.body2.lineHeight,
      fontWeight: typography.fontWeightMedium,
    };
  };
