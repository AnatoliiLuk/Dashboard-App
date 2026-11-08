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

const EMAIL_MAX_LENGTH = 254;

/** Same normalisation as the API's `emailSchema`: trim, then lowercase. */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/** Email field rule shared by every form; matches the API. */
export function emailField(t: TFunction) {
  return z
    .string()
    .trim()
    .toLowerCase()
    .min(1, t('validation.email'))
    .max(EMAIL_MAX_LENGTH, t('validation.email'))
    .email(t('validation.email'));
}

export function loginFormSchema(t: TFunction) {
  return z.object({
    email: emailField(t),
    password: z.string().min(1, t('validation.password')),
  });
}

export function registerFormSchema(t: TFunction) {
  return z.object({
    name: z.string().trim().min(1, t('validation.name')),
    email: emailField(t),
    password: z.string().min(8, t('validation.passwordLength')),
  });
}

/** `currentEmail` decides whether the email changed, which needs the password. */
export function profileFormSchema(t: TFunction, currentEmail: string) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(1, t('validation.name'))
        .max(100, t('validation.nameLength')),
      email: emailField(t),
      currentPassword: z.string(),
    })
    .refine(
      (data) => data.email === currentEmail || data.currentPassword !== '',
      {
        message: t('validation.currentPassword'),
        path: ['currentPassword'],
      },
    );
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
        .max(
          MAX_GOAL_HABITS,
          t('validation.habitsMax', { max: MAX_GOAL_HABITS }),
        )
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
export function securityFormSchema(t: TFunction) {
  return z
    .object({
      currentPassword: z.string().min(1, t('validation.password')),
      newPassword: z
        .string()
        .min(8, t('validation.passwordLength'))
        .max(128, t('validation.passwordMax')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('validation.passwordMatch'),
      path: ['confirmPassword'],
    })
    .refine((data) => data.newPassword !== data.currentPassword, {
      message: t('validation.passwordSame'),
      path: ['newPassword'],
    });
}

export function deleteAccountFormSchema(t: TFunction) {
  return z.object({
    password: z.string().min(1, t('validation.password')),
  });
}

export type ProfileFormValues = z.infer<ReturnType<typeof profileFormSchema>>;
export type SecurityFormValues = z.infer<ReturnType<typeof securityFormSchema>>;
export type DeleteAccountFormValues = z.infer<
  ReturnType<typeof deleteAccountFormSchema>
>;
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
