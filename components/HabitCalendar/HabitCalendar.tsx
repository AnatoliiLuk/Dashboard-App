'use client';

import { Box, Typography } from '@mui/material';
import { useState } from 'react';

import { monthWeeks, weekdayLabels } from '@/lib/habits/calendar';
import { addMonths, monthTitle } from '@/lib/habits/dates';
import type { HabitStore } from '@/lib/habits/storage';

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
} from './HabitCalendar.style';

type HabitCalendarProps = {
  store: HabitStore;
  today: string;
};

export function HabitCalendar({ store, today }: HabitCalendarProps) {
  const [month, setMonth] = useState(today);
  const weeks = monthWeeks(store, month);

  return (
    <Box
      component="section"
      sx={calendarSectionStyle}
      aria-label="Habit calendar"
    >
      <Box sx={monthBarStyle}>
        <Box
          component="button"
          type="button"
          sx={monthButtonStyle}
          onClick={() => setMonth(addMonths(month, -1))}
        >
          Previous month
        </Box>
        <Typography variant="h6" component="h2">
          {monthTitle(month)}
        </Typography>
        <Box
          component="button"
          type="button"
          sx={monthButtonStyle}
          onClick={() => setMonth(addMonths(month, 1))}
        >
          Next month
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
                  <Box
                    component="td"
                    key={day.date}
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
                          <Box
                            component="li"
                            key={habit.id}
                            sx={habitItemStyle}
                          >
                            {habit.name}
                          </Box>
                        ))}
                      </Box>
                    ) : null}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
