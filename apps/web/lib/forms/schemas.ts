import type { TFunction } from 'i18next';
import { z } from 'zod';

import { HABIT_COLORS, type HabitColor } from '@/lib/habits/colors';

const habitColorIds = HABIT_COLORS.map((color) => color.id) as [
  HabitColor,
  ...HabitColor[],
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

export type LoginFormValues = z.infer<ReturnType<typeof loginFormSchema>>;
export type RegisterFormValues = z.infer<ReturnType<typeof registerFormSchema>>;
export type HabitFormValues = z.infer<ReturnType<typeof habitFormSchema>>;
