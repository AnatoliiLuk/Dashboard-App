'use client';

import { Box, Typography } from '@mui/material';
import { useState } from 'react';

import { ArrowLeftIcon, ArrowRightIcon } from '@/components/icons';
import { monthWeeks, WEEKDAYS, weekDays } from '@/lib/habits/calendar';
import { useTranslation } from '@/lib/i18n';
import type { HabitStore } from '@/lib/habits/storage';

import { DayCell } from './DayCell';
import { CALENDAR_VIEWS, calendarViewLabel } from './HabitCalendar.constants';
import {
  calendarHeading,
  calendarStepLabel,
  currentPeriodLabel,
  isCurrentPeriod,
  loadCalendarView,
  saveCalendarView,
  shiftCalendar,
} from './HabitCalendar.helpers';
import {
  calendarSectionStyle,
  headerCellStyle,
  monthBarStyle,
  monthButtonStyle,
  stepButtonStyle,
  tableStyle,
  tableWrapStyle,
  viewBarStyle,
  viewButtonActiveStyle,
  viewOptionsStyle,
} from './HabitCalendar.style';

type HabitCalendarProps = {
  store: HabitStore;
  today: string;
};

export function HabitCalendar({ store, today }: HabitCalendarProps) {
  const { t, i18n } = useTranslation();
  const [cursor, setCursor] = useState(today);
  const [view, setView] = useState(loadCalendarView);
  const weeks =
    view === 'week' ? [weekDays(store, cursor)] : monthWeeks(store, cursor);
  const here = isCurrentPeriod(cursor, today, view);

  return (
    <Box
      component="section"
      sx={calendarSectionStyle}
      aria-label={t('calendar.label')}
    >
      <Box sx={viewBarStyle}>
        <Box sx={viewOptionsStyle} role="group" aria-label={t('calendar.view')}>
          {CALENDAR_VIEWS.map((option) => (
            <Box
              key={option}
              component="button"
              type="button"
              aria-pressed={view === option}
              sx={[
                monthButtonStyle,
                view === option ? viewButtonActiveStyle : null,
              ]}
              onClick={() => {
                saveCalendarView(option);
                setView(option);
              }}
            >
              {t(calendarViewLabel[option])}
            </Box>
          ))}
        </Box>
        <Box
          component="button"
          type="button"
          sx={monthButtonStyle}
          disabled={here}
          onClick={() => setCursor(today)}
        >
          {currentPeriodLabel(today, here, t)}
        </Box>
      </Box>
      <Box sx={monthBarStyle}>
        <Box
          component="button"
          type="button"
          aria-label={calendarStepLabel(view, 'previous', t)}
          sx={[monthButtonStyle, stepButtonStyle]}
          onClick={() => setCursor(shiftCalendar(cursor, view, -1))}
        >
          <ArrowLeftIcon width={16} height={16} />
        </Box>
        <Typography variant="h6" component="h2">
          {calendarHeading(cursor, view, i18n.language)}
        </Typography>
        <Box
          component="button"
          type="button"
          aria-label={calendarStepLabel(view, 'next', t)}
          sx={[monthButtonStyle, stepButtonStyle]}
          onClick={() => setCursor(shiftCalendar(cursor, view, 1))}
        >
          <ArrowRightIcon width={16} height={16} />
        </Box>
      </Box>

      <Box sx={tableWrapStyle}>
        <Box component="table" sx={tableStyle}>
          <Box component="thead">
            <Box component="tr">
              {WEEKDAYS.map((day) => (
                <Box component="th" key={day} scope="col" sx={headerCellStyle}>
                  {t(`calendar.weekdays.${day}`)}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {weeks.map((week) => (
              <Box component="tr" key={week[0].date}>
                {week.map((day) => (
                  <DayCell key={day.date} day={day} today={today} />
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
