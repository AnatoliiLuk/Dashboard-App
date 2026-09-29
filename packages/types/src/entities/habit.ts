import type { HabitColor } from '../enums/habit-color.enum';

export type Habit = {
  id: string;
  ownerId: string;
  name: string;
  createdOn: string;
  color: HabitColor;
};
