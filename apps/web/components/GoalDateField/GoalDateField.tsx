'use client';

import { Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { dayjs } from '@/lib/dates/dayjs';

import { dateFieldStyle, pickerStyle } from './GoalDateField.style';

/** Same day-month-year order as `formatDisplay`. */
const DISPLAY_FORMAT = 'DD-MM-YYYY';

type GoalDateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
};

function toDayjs(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = dayjs(value, 'YYYY-MM-DD', true);
  return parsed.isValid() ? parsed : null;
}

function GoalDateField({
  label,
  value,
  onChange,
  error = false,
  helperText,
  disabled = false,
}: GoalDateFieldProps) {
  return (
    <Box sx={dateFieldStyle}>
      <DatePicker
        label={label}
        value={toDayjs(value)}
        format={DISPLAY_FORMAT}
        disabled={disabled}
        desktopModeMediaQuery="@media (pointer: fine)"
        sx={pickerStyle}
        onChange={(next) => {
          if (next == null) {
            onChange('');
            return;
          }
          if (!next.isValid()) {
            return;
          }
          onChange(next.format('YYYY-MM-DD'));
        }}
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
            error,
            helperText,
          },
        }}
      />
    </Box>
  );
}

export { GoalDateField };
