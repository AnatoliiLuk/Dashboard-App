'use client';

import { Box } from '@mui/material';
import { useId, type ReactNode } from 'react';

import { ChevronDownIcon } from '@/components/icons';

import {
  actionStyle,
  chevronStyle,
  compactIconStyle,
  compactStyle,
  labelStyle,
  optionActiveStyle,
  optionStyle,
  optionsScrollStyle,
  optionsStyle,
  rowStyle,
  selectStyle,
  selectWithIconStyle,
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
  action?: ReactNode;
  /** Shown inside the compact phone picker in place of the visible label. */
  icon?: ReactNode;
};

// On a phone the options would not fit side by side, so the same choice
// becomes a native picker that always shows the current value.
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  action,
  icon,
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
      <Box sx={compactStyle}>
        {icon ? (
          <Box component="span" sx={compactIconStyle}>
            {icon}
          </Box>
        ) : null}
        <Box
          component="select"
          aria-labelledby={labelId}
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          sx={[selectStyle, icon ? selectWithIconStyle : null]}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Box>
        <Box component="span" sx={chevronStyle}>
          <ChevronDownIcon width={14} height={14} />
        </Box>
      </Box>
      {action ? <Box sx={actionStyle}>{action}</Box> : null}
    </Box>
  );
}
