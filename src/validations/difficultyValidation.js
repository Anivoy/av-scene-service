import { z } from 'zod';

export const createDifficultySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  description: z.string().optional(),
  colorCode: z.string().optional(),
  multiplier: z.float64().optional(),
});

export const updateDifficultySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long').optional(),
  description: z.string().optional().nullable(),
  colorCode: z.string().optional().nullable(),
  multiplier: z.float64().optional(),
});

export const idParamSchema = z.uuid('Invalid difficulty ID format');
export const idsParamSchema = z.array(z.uuid()).min(1, 'At least one ID is required');

export const listDifficultiesQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
