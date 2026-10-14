import type { GoalColor } from '../enums/goal-color.enum';

export type Goal = {
  id: string;
  ownerId: string;
  name: string;
  color: GoalColor;
  startDate: string;
  endDate: string;
  habitIds: string[];
};
