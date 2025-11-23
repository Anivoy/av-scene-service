import { z } from 'zod';

export const createSeasonSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long').optional(),
  year: z
    .number({
      required_error: 'Year is required',
      invalid_type_error: 'Year must be a number',
    })
    .int()
    .min(1900, 'Year must be reasonable')
    .max(2100, 'Year must be reasonable'),
  quarter: z.enum(['Winter', 'Spring', 'Summer', 'Fall'], {
    required_error: 'Quarter is required',
  }),
});

export const updateSeasonSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long').optional().nullable(),
  year: z
    .number()
    .int()
    .min(1900, 'Year must be reasonable')
    .max(2100, 'Year must be reasonable')
    .optional()
    .nullable(),
  quarter: z.enum(['Winter', 'Spring', 'Summer', 'Fall']).optional().nullable(),
});

export const idParamSchema = z.uuid('Invalid season ID format');

export const idsParamSchema = z.array(z.uuid()).min(1, 'At least one ID is required');

export const listSeasonsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'year', 'quarter', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
