import z from "zod";

export const createShowSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  alternativeTitle: z.string().max(255, "Alternate title is too long").optional(),
  synopsis: z.string().optional(),
  type: z.enum(['Movie', 'Series']).optional(),
  genreIds: z.array(z.uuid()).optional(),
  difficultyId: z.uuid().optional(),
  seasonId: z.uuid().optional(),
});

export const updateShowSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long').optional(),
  alternativeTitle: z.string().max(255, "Alternate title is too long").optional().nullable(),
  synopsis: z.string().optional().nullable(),
  type: z.enum(['Movie', 'Series']).optional().nullable(),
  genreIds: z.array(z.uuid()).optional(),
  difficultyId: z.uuid().optional().nullable(),
  seasonId: z.uuid().optional().nullable(),
});

export const idParamSchema = z.uuid('Invalid show ID format');
export const idsParamSchema = z.array(z.uuid()).min(1, 'At least one ID is required');

export const listShowsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
  search: z.string().optional(),
  type: z.enum(['Movie', 'Series']).optional(),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});
