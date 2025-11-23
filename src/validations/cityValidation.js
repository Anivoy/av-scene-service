import { z } from 'zod';

export const createCitySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  description: z.string().optional(),
  prefectureId: z.string().min(1, 'Prefecture ID is required'),
});

export const updateCitySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long').optional(),
  description: z.string().optional().nullable(),
  prefectureId: z.string().optional(),
});

export const idParamSchema = z.uuid('Invalid ID format');
export const idsParamSchema = z.array(z.uuid()).min(1, 'At least one ID is required');

export const listCitiesQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
