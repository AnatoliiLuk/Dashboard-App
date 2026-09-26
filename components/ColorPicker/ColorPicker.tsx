import { Box } from '@mui/material';

import { HABIT_COLORS, habitColor, type HabitColor } from '@/lib/habits/colors';

import { colorPickerStyle, colorSwatchStyle } from './ColorPicker.style';

type ColorPickerProps = {
  value: HabitColor;
  onChange: (color: HabitColor) => void;
  label: string;
};

function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <Box sx={colorPickerStyle} role="radiogroup" aria-label={label}>
      {HABIT_COLORS.map((color) => (
        <Box
          key={color.id}
          component="button"
          type="button"
          role="radio"
          aria-checked={value === color.id}
          aria-label={color.label}
          onClick={() => onChange(color.id)}
          sx={colorSwatchStyle(
            habitColor(color.id).background,
            value === color.id,
          )}
        />
      ))}
    </Box>
  );
}

export { ColorPicker };
