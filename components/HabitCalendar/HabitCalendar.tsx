'use client';

import { Box, Typography } from '@mui/material';
import { useState } from 'react';

import { monthWeeks, weekDays, weekdayLabels } from '@/lib/habits/calendar';
import type { CalendarDay } from '@/lib/habits/calendar';
import type { HabitStore } from '@/lib/habits/storage';

import {
  calendarHeading,
  calendarStepLabel,
  loadCalendarView,
  saveCalendarView,
  shiftCalendar,
} from './HabitCalendar.helpers';
import {
  calendarSectionStyle,
  cellStyle,
  dayNumberStyle,
  habitItemStyle,
  habitListStyle,
  headerCellStyle,
  monthBarStyle,
  monthButtonStyle,
  outsideStyle,
  tableStyle,
  tableWrapStyle,
  todayStyle,
  viewBarStyle,
  viewButtonActiveStyle,
} from './HabitCalendar.style';

type HabitCalendarProps = {
  store: HabitStore;
  today: string;
};

function DayCell({ day, today }: { day: CalendarDay; today: string }) {
  return (
    <Box
      component="td"
      sx={[
        cellStyle,
        !day.inMonth ? outsideStyle : null,
        day.date === today ? todayStyle : null,
      ]}
    >
      <Typography variant="body2" sx={dayNumberStyle}>
        {Number(day.date.slice(8, 10))}
      </Typography>
      {day.habits.length > 0 ? (
        <Box component="ul" sx={habitListStyle}>
          {day.habits.map((habit) => (
            <Box component="li" key={habit.id} sx={habitItemStyle}>
              {habit.name}
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

export function HabitCalendar({ store, today }: HabitCalendarProps) {
  const [cursor, setCursor] = useState(today);
  const [view, setView] = useState(loadCalendarView);
  const weeks =
    view === 'week' ? [weekDays(store, cursor)] : monthWeeks(store, cursor);

  return (
    <Box
      component="section"
      sx={calendarSectionStyle}
      aria-label="Habit calendar"
    >
      <Box sx={viewBarStyle} role="group" aria-label="Calendar view">
        {(['month', 'week'] as const).map((option) => (
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
            {option === 'month' ? 'Month' : 'Week'}
          </Box>
        ))}
      </Box>
      <Box sx={monthBarStyle}>
        <Box
          component="button"
          type="button"
          sx={monthButtonStyle}
          onClick={() => setCursor(shiftCalendar(cursor, view, -1))}
        >
          {calendarStepLabel(view, 'previous')}
        </Box>
        <Typography variant="h6" component="h2">
          {calendarHeading(cursor, view)}
        </Typography>
        <Box
          component="button"
          type="button"
          sx={monthButtonStyle}
          onClick={() => setCursor(shiftCalendar(cursor, view, 1))}
        >
          {calendarStepLabel(view, 'next')}
        </Box>
      </Box>

      <Box sx={tableWrapStyle}>
        <Box component="table" sx={tableStyle}>
          <Box component="thead">
            <Box component="tr">
              {weekdayLabels().map((label) => (
                <Box
                  component="th"
                  key={label}
                  scope="col"
                  sx={headerCellStyle}
                >
                  {label}
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
