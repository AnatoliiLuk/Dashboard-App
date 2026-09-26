'use client';

import { Box } from '@mui/material';

import { HABIT_COLORS, habitColor, type HabitColor } from '@/lib/habits/colors';
import { useTranslation } from '@/lib/i18n';

import { colorPickerStyle, colorSwatchStyle } from './ColorPicker.style';

type ColorPickerProps = {
  value: HabitColor;
  onChange: (color: HabitColor) => void;
  label: string;
};

function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const { t } = useTranslation();

  return (
    <Box sx={colorPickerStyle} role="radiogroup" aria-label={label}>
      {HABIT_COLORS.map(({ id }) => {
        const selected = value === id;
        const { background } = habitColor(id);

        return (
          <Box
            key={id}
            component="button"
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={t(`colors.${id}`)}
            onClick={() => onChange(id)}
            sx={colorSwatchStyle(background, selected)}
          />
        );
      })}
    </Box>
  );
}

export { ColorPicker };
