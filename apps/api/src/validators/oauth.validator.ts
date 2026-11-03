import { z } from 'zod';

// The signed request is a JWT of a few hundred characters.
const consentRequestSchema = z
  .string()
  .min(1, 'Authorization request is required')
  .max(4000);

export const consentQuerySchema = z.object({
  request: consentRequestSchema,
});

export const consentDecisionSchema = z.object({
  request: consentRequestSchema,
  approve: z.boolean(),
});

export const grantParamsSchema = z.object({
  clientId: z.string().min(1).max(200),
});

export type ConsentDecisionBody = z.infer<typeof consentDecisionSchema>;
