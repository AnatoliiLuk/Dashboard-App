import { Box, Typography } from '@mui/material';

import { ColorPicker } from '@/components/ColorPicker';
import { HabitTag } from '@/components/HabitTag';
import type { HabitColor } from '@/lib/habits/colors';
import { formatDisplay } from '@/lib/habits/dates';
import type { HabitToday } from '@/lib/habits/useHabitLog';

import { streakMessage } from './HabitCard.helpers';
import {
  dayDoneStyle,
  dayStyle,
  daysStyle,
  habitColorStyle,
  habitNameStyle,
  habitStyle,
  habitTopStyle,
  messageStyle,
  toggleStyle,
} from './HabitCard.style';

type HabitCardProps = {
  item: HabitToday;
  onToggle: (habitId: string) => void;
  onColor: (habitId: string, color: HabitColor) => void;
};

function HabitCard({ item, onToggle, onColor }: HabitCardProps) {
  return (
    <Box component="li" sx={habitStyle}>
      <Box sx={habitTopStyle}>
        <Box sx={habitNameStyle}>
          <HabitTag name={item.habit.name} color={item.habit.color} />
        </Box>
        <Box
          component="button"
          type="button"
          sx={toggleStyle}
          aria-pressed={item.doneToday}
          onClick={() => onToggle(item.habit.id)}
        >
          {item.doneToday ? 'Undo' : 'Done today'}
        </Box>
      </Box>
      <Box sx={habitColorStyle}>
        <ColorPicker
          value={item.habit.color}
          onChange={(next) => onColor(item.habit.id, next)}
          label={`Color for ${item.habit.name}`}
        />
      </Box>
      <Typography variant="body2" sx={messageStyle}>
        {streakMessage(item.currentStreak, item.doneToday)}
      </Typography>
      <Box sx={daysStyle} aria-hidden="true">
        {item.days.map((day) => (
          <Box
            key={day.date}
            sx={day.done ? dayDoneStyle : dayStyle}
            title={formatDisplay(day.date)}
          />
        ))}
      </Box>
    </Box>
  );
}

export { HabitCard };
