'use client';

import { Box } from '@mui/material';
import { useId } from 'react';

import { GOAL_COLORS, goalColor, type GoalColor } from '@/lib/goals/colors';
import { useTranslation } from '@/lib/i18n';

import {
  colorPickerStyle,
  colorSwatchStyle,
  fieldStyle,
  labelStyle,
} from './GoalColorPicker.style';

type GoalColorPickerProps = {
  value: GoalColor;
  onChange: (color: GoalColor) => void;
  label: string;
  disabled?: boolean;
};

function GoalColorPicker({
  value,
  onChange,
  label,
  disabled = false,
}: GoalColorPickerProps) {
  const { t } = useTranslation();
  const labelId = useId();

  return (
    <Box sx={fieldStyle}>
      <Box component="span" id={labelId} sx={labelStyle(disabled)}>
        {label}:
      </Box>
      <Box sx={colorPickerStyle} role="radiogroup" aria-labelledby={labelId}>
        {GOAL_COLORS.map(({ id }) => {
          const selected = value === id;
          const { background } = goalColor(id);

          return (
            <Box
              key={id}
              component="button"
              type="button"
              role="radio"
              disabled={disabled}
              aria-checked={selected}
              aria-label={t(`colors.${id}`)}
              onClick={() => onChange(id)}
              sx={colorSwatchStyle(background, selected)}
            />
          );
        })}
      </Box>
    </Box>
  );
}

export { GoalColorPicker };
