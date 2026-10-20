'use client';

import { Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { usePickerAdapter } from '@mui/x-date-pickers/hooks';
import {
  PickersDay,
  type PickersDayProps,
} from '@mui/x-date-pickers/PickersDay';
import { createContext, useContext, useMemo } from 'react';

import { dayjs } from '@/lib/dates/dayjs';

import {
  dateFieldStyle,
  pickerStyle,
  rangeCellStyle,
  type RangePlacement,
} from './GoalDateField.style';

/** Day-month-year order for the date field. */
const DISPLAY_FORMAT = 'DD-MM-YYYY';

type RangeDates = {
  start: ReturnType<typeof toDayjs>;
  end: ReturnType<typeof toDayjs>;
};

const RangeDatesContext = createContext<RangeDates>({
  start: null,
  end: null,
});

type GoalDateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rangeStart: string;
  rangeEnd: string;
  fallbackDate?: string;
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

function rangePlacement(
  day: PickersDayProps['day'],
  start: RangeDates['start'],
  end: RangeDates['end'],
  hidden: boolean,
  adapter: ReturnType<typeof usePickerAdapter>,
): RangePlacement & { endpoint: boolean } {
  const isStart = start != null && adapter.isSameDay(day, start);
  const isEnd = end != null && adapter.isSameDay(day, end);
  const ordered =
    start != null && end != null && !adapter.isBeforeDay(end, start);
  const spansDays = ordered && !adapter.isSameDay(start, end);
  const between =
    spansDays &&
    adapter.isAfterDay(day, start) &&
    adapter.isBeforeDay(day, end);
  const inRange = !hidden && spansDays && (isStart || isEnd || between);
  const weekStart = adapter.isSameDay(day, adapter.startOfWeek(day));
  const weekEnd = adapter.isSameDay(day, adapter.endOfWeek(day));

  return {
    inRange,
    capStart: inRange && (isStart || weekStart),
    capEnd: inRange && (isEnd || weekEnd),
    endpoint: !hidden && (isStart || isEnd),
  };
}

function RangeDay({
  day,
  outsideCurrentMonth,
  showDaysOutsideCurrentMonth = false,
  selected = false,
  ...other
}: PickersDayProps) {
  const { start, end } = useContext(RangeDatesContext);
  const adapter = usePickerAdapter();
  const hidden = outsideCurrentMonth && !showDaysOutsideCurrentMonth;
  const placement = rangePlacement(day, start, end, hidden, adapter);
  const marked = selected || placement.endpoint;

  return (
    <Box sx={rangeCellStyle(placement)}>
      <PickersDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        showDaysOutsideCurrentMonth={showDaysOutsideCurrentMonth}
        selected={marked}
        aria-selected={marked}
        disableMargin
      />
    </Box>
  );
}

function GoalDateField({
  label,
  value,
  onChange,
  rangeStart,
  rangeEnd,
  fallbackDate = '',
  error = false,
  helperText,
  disabled = false,
}: GoalDateFieldProps) {
  const range = useMemo(
    () => ({ start: toDayjs(rangeStart), end: toDayjs(rangeEnd) }),
    [rangeStart, rangeEnd],
  );
  const parsed = toDayjs(value);

  return (
    <Box sx={dateFieldStyle}>
      <RangeDatesContext.Provider value={range}>
        <DatePicker
          label={label}
          value={parsed}
          referenceDate={parsed ?? toDayjs(fallbackDate) ?? undefined}
          format={DISPLAY_FORMAT}
          disabled={disabled}
          desktopModeMediaQuery="@media (pointer: fine)"
          sx={pickerStyle}
          slots={{ day: RangeDay }}
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
      </RangeDatesContext.Provider>
    </Box>
  );
}

export { GoalDateField };
