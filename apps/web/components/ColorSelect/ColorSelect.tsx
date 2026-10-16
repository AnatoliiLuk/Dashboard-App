'use client';

import { Box, MenuItem, TextField } from '@mui/material';
import type { GoalColor, HabitColor } from '@repo/types';

import { useTranslation } from '@/lib/i18n';

import {
  fieldStyle,
  optionStyle,
  swatchStyle,
  valueStyle,
} from './ColorSelect.style';

type ColorId = HabitColor | GoalColor;

type ColorOption<T extends ColorId> = {
  id: T;
  background: string;
};

type ColorSelectProps<T extends ColorId> = {
  value: T;
  options: readonly ColorOption<T>[];
  onChange: (color: T) => void;
  label: string;
  disabled?: boolean;
};

function ColorValue({
  background,
  name,
}: {
  background: string;
  name: string;
}) {
  return (
    <Box sx={valueStyle}>
      <Box component="span" aria-hidden sx={swatchStyle(background)} />
      {name}
    </Box>
  );
}

function ColorSelect<T extends ColorId>({
  value,
  options,
  onChange,
  label,
  disabled = false,
}: ColorSelectProps<T>) {
  const { t } = useTranslation();
  const selected = options.find((option) => option.id === value) ?? options[0];

  return (
    <TextField
      select
      fullWidth
      size="small"
      label={label}
      value={value}
      disabled={disabled}
      sx={fieldStyle}
      onChange={(event) => onChange(event.target.value as T)}
      slotProps={{
        select: {
          renderValue: () => (
            <ColorValue
              background={selected.background}
              name={t(`colors.${selected.id}`)}
            />
          ),
        },
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.id} value={option.id} sx={optionStyle}>
          <ColorValue
            background={option.background}
            name={t(`colors.${option.id}`)}
          />
        </MenuItem>
      ))}
    </TextField>
  );
}

export { ColorSelect };
export type { ColorOption };
