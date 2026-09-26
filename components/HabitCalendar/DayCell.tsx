import { Box, Typography } from '@mui/material';

import { HabitTag } from '@/components/HabitTag';
import type { CalendarDay } from '@/lib/habits/calendar';

import {
  cellStyle,
  dayNumberStyle,
  habitListStyle,
  outsideStyle,
  todayStyle,
} from './HabitCalendar.style';

type DayCellProps = {
  day: CalendarDay;
  today: string;
};

function DayCell({ day, today }: DayCellProps) {
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
            <Box component="li" key={habit.id}>
              <HabitTag name={habit.name} color={habit.color} />
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

export { DayCell };
