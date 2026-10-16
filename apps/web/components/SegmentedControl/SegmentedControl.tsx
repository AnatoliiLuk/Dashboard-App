'use client';

import { Box } from '@mui/material';
import { useId } from 'react';

import {
  labelStyle,
  optionActiveStyle,
  optionStyle,
  optionsScrollStyle,
  optionsStyle,
  rowStyle,
} from './SegmentedControl.style';

type SegmentedOption<T extends string> = {
  id: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  label: string;
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  const labelId = useId();

  return (
    <Box sx={rowStyle}>
      <Box component="span" id={labelId} sx={labelStyle}>
        {label}:
      </Box>
      <Box sx={optionsScrollStyle}>
        <Box sx={optionsStyle} role="group" aria-labelledby={labelId}>
          {options.map((option) => (
            <Box
              key={option.id}
              component="button"
              type="button"
              aria-pressed={value === option.id}
              sx={[optionStyle, value === option.id ? optionActiveStyle : null]}
              onClick={() => onChange(option.id)}
            >
              {option.label}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
