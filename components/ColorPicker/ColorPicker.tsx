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
      {HABIT_COLORS.map(({ id, label }) => {
        const selected = value === id;
        const { background } = habitColor(id);

        return (
          <Box
            key={id}
            component="button"
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            onClick={() => onChange(id)}
            sx={colorSwatchStyle(background, selected)}
          />
        );
      })}
    </Box>
  );
}

export { ColorPicker };
