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
