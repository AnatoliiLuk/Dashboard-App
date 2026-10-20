import { GoalColor } from '@prisma/client';
import { z } from 'zod';

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
  .refine(isRealCalendarDate, 'Date must be a valid calendar date');

const habitIdsSchema = z
  .array(z.string().min(1, 'Habit id is required'))
  .min(1, 'At least one habit is required')
  .max(4, 'A goal can include at most 4 habits')
  .refine((ids) => new Set(ids).size === ids.length, {
    message: 'Habit ids must be unique',
  });

const goalFieldsSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  color: z.nativeEnum(GoalColor),
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  habitIds: habitIdsSchema,
});

export const createGoalSchema = goalFieldsSchema.refine(
  (data) => data.startDate <= data.endDate,
  { message: 'Start date must be on or before end date' },
);

export const updateGoalSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100).optional(),
    color: z.nativeEnum(GoalColor).optional(),
    startDate: isoDateSchema.optional(),
    endDate: isoDateSchema.optional(),
    habitIds: habitIdsSchema.optional(),
    archived: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.color !== undefined ||
      data.startDate !== undefined ||
      data.endDate !== undefined ||
      data.habitIds !== undefined ||
      data.archived !== undefined,
    { message: 'At least one field is required' },
  )
  .refine(
    (data) =>
      data.startDate === undefined ||
      data.endDate === undefined ||
      data.startDate <= data.endDate,
    { message: 'Start date must be on or before end date' },
  );

export type CreateGoalBody = z.infer<typeof createGoalSchema>;
export type UpdateGoalBody = z.infer<typeof updateGoalSchema>;

function isRealCalendarDate(value: string): boolean {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
