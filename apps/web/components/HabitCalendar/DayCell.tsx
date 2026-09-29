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
  const { date, inMonth, habits } = day;

  return (
    <Box
      component="td"
      sx={[
        cellStyle,
        !inMonth ? outsideStyle : null,
        date === today ? todayStyle : null,
      ]}
    >
      <Typography variant="body2" sx={dayNumberStyle}>
        {Number(date.slice(8, 10))}
      </Typography>
      {habits.length > 0 ? (
        <Box component="ul" sx={habitListStyle}>
          {habits.map(({ id, name, color }) => (
            <Box component="li" key={id}>
              <HabitTag name={name} color={color} />
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

export { DayCell };
