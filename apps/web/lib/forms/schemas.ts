import type { TFunction } from 'i18next';
import { z } from 'zod';

import { MAX_GOAL_HABITS } from '@/lib/goals/constants';
import { GOAL_COLORS, type GoalColor } from '@/lib/goals/colors';
import { HABIT_COLORS, type HabitColor } from '@/lib/habits/colors';

const habitColorIds = HABIT_COLORS.map((color) => color.id) as [
  HabitColor,
  ...HabitColor[],
];

const goalColorIds = GOAL_COLORS.map((color) => color.id) as [
  GoalColor,
  ...GoalColor[],
];

export function loginFormSchema(t: TFunction) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, t('validation.email'))
      .email(t('validation.email')),
    password: z.string().min(1, t('validation.password')),
  });
}

export function registerFormSchema(t: TFunction) {
  return z.object({
    name: z.string().trim().min(1, t('validation.name')),
    email: z
      .string()
      .trim()
      .min(1, t('validation.email'))
      .email(t('validation.email')),
    password: z.string().min(8, t('validation.passwordLength')),
  });
}

export function habitFormSchema(t: TFunction) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t('validation.habit'))
      .max(100, t('validation.habitLength')),
    color: z.enum(habitColorIds),
  });
}

export function goalFormSchema(t: TFunction) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(1, t('validation.goal'))
        .max(100, t('validation.goalLength')),
      color: z.enum(goalColorIds),
      startDate: isoDate(t('validation.startDate')),
      endDate: isoDate(t('validation.endDate')),
      habitIds: z
        .array(z.string().min(1))
        .min(1, t('validation.habits'))
        .max(MAX_GOAL_HABITS, t('validation.habitsMax'))
        .refine((ids) => new Set(ids).size === ids.length, {
          message: t('validation.habits'),
        }),
    })
    .refine((data) => data.startDate <= data.endDate, {
      message: t('validation.dateOrder'),
      path: ['endDate'],
    });
}

export type LoginFormValues = z.infer<ReturnType<typeof loginFormSchema>>;
export type RegisterFormValues = z.infer<ReturnType<typeof registerFormSchema>>;
export type HabitFormValues = z.infer<ReturnType<typeof habitFormSchema>>;
export type GoalFormValues = z.infer<ReturnType<typeof goalFormSchema>>;

function isoDate(message: string) {
  return z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, message)
    .refine(isRealCalendarDate, message);
}

function isRealCalendarDate(value: string): boolean {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
