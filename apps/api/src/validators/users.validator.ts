import { z } from 'zod';

import { emailSchema } from './auth.validator';

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(100, 'Name must be at most 100 characters')
      .optional(),
    email: emailSchema.optional(),
    currentPassword: z.string().min(1).optional(),
  })
  .refine((body) => body.name !== undefined || body.email !== undefined, {
    message: 'Provide a name or an email',
  });

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(128, 'New password must be at most 128 characters'),
});

export type ChangePasswordBody = z.infer<typeof changePasswordSchema>;
