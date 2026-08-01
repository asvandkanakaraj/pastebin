import { z } from 'zod';

export const CreatePasteSchema = z
  .object({
    title: z.string().max(100).optional(),
    description: z.string().max(300, 'Description cannot exceed 300 characters').optional(),
    content: z.string().min(1, 'Content is required'),
    language: z.string().default('plaintext'),
    isPublic: z.boolean().default(true),
    visibility: z.enum(['PUBLIC', 'PRIVATE', 'SECRET']).default('PUBLIC'),
    password: z.string().optional().or(z.literal('')),
    expiresInSeconds: z.number().int().positive().optional(),
    shares: z
      .array(
        z.object({
          userId: z.string(),
          permission: z.enum(['READ', 'WRITE']),
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.visibility === 'PRIVATE') {
        if (!data.password) return false;
        return /^\d{4,8}$/.test(data.password);
      }
      return true;
    },
    {
      message: 'PIN must be between 4 and 8 digits',
      path: ['password'],
    }
  );

export const PasteResponseSchema = z.object({
  id: z.string(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  content: z.string(),
  language: z.string(),
  visibility: z.string(),
  isPublic: z.boolean(),
  userId: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
