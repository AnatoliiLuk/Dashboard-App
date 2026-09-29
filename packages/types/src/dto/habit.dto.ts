import type { HabitColor } from '../enums/habit-color.enum';

export type CreateHabitDto = {
  name: string;
  color: HabitColor;
};

export type UpdateHabitDto = {
  name?: string;
  color?: HabitColor;
};
