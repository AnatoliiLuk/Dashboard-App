import type { GoalColor } from '../enums/goal-color.enum';

export type CreateGoalDto = {
  name: string;
  color: GoalColor;
  startDate: string;
  endDate: string;
  habitIds: string[];
};

export type UpdateGoalDto = {
  name?: string;
  color?: GoalColor;
  startDate?: string;
  endDate?: string;
  habitIds?: string[];
  archived?: boolean;
};
