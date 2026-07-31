import { z } from 'zod';

export const CreatePasteSchema = z.object({
  title: z.string().max(100).optional(),
  content: z.string().min(1, 'Content is required'),
  language: z.string().default('plaintext'),
  isPublic: z.boolean().default(true),
  password: z.string().min(4).optional(),
  expiresInSeconds: z.number().int().positive().optional(),
});

export const PasteResponseSchema = z.object({
  id: z.string(),
  title: z.string().nullable().optional(),
  content: z.string(),
  language: z.string(),
  isPublic: z.boolean(),
  userId: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
