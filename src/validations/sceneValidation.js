import { z } from 'zod';

export const createSceneSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  description: z.string().optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90, 'Invalid latitude'),
  longitude: z.coerce.number().min(-180).max(180, 'Invalid longitude'),
  showId: z.uuid('Invalid show ID'),
  difficultyId: z.uuid('Invalid difficulty ID'),
  cityId: z.uuid('Invalid city ID').optional().nullable(),
  prefectureId: z.uuid('Invalid prefecture ID').optional().nullable(),
  regionId: z.uuid('Invalid region ID').optional().nullable(),
  imageAlts: z
    .array(z.string().optional())
    .optional()
    .transform((val) => val || []),
});

export const updateSceneSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long').optional(),
  description: z.string().optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90, 'Invalid latitude').optional(),
  longitude: z.coerce.number().min(-180).max(180, 'Invalid longitude').optional(),
  showId: z.uuid('Invalid show ID').optional(),
  difficultyId: z.uuid('Invalid difficulty ID').optional(),
  cityId: z.uuid('Invalid city ID').optional().nullable(),
  prefectureId: z.uuid('Invalid prefecture ID').optional().nullable(),
  regionId: z.uuid('Invalid region ID').optional().nullable(),
  newImageAlts: z
    .array(z.string().optional())
    .optional()
    .transform((val) => val || []),
  deletedImageIds: z
    .array(z.uuid('Invalid image ID'))
    .optional()
    .transform((val) => val || []),
});

export const listScenesQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  showId: z.uuid().optional(),
  difficultyId: z.uuid().optional(),
  cityId: z.uuid().optional(),
  prefectureId: z.uuid().optional(),
  regionId: z.uuid().optional(),
});

export const getRandomScenesSchema = z.object({
  count: z
    .number()
    .int()
    .min(1, 'Count must be at least 1')
    .max(50, 'Count cannot exceed 50')
    .optional(),
  difficultyWeights: z
    .array(
      z.object({
        difficultyId: z.uuid('Invalid difficulty ID'),
        weight: z.number().min(0, 'Weight must be non-negative'),
      }),
    ).optional(),
  showId: z.uuid('Invalid show ID').optional(),
  cityId: z.uuid('Invalid city ID').optional(),
  prefectureId: z.uuid('Invalid prefecture ID').optional(),
  regionId: z.uuid('Invalid region ID').optional(),
  excludeSceneIds: z.array(z.uuid()).optional(),
});

export const calculateDistanceSchema = z.object({
  sceneId: z.uuid('Invalid scene ID'),
  guessLatitude: z.number().min(-90).max(90, 'Invalid latitude'),
  guessLongitude: z.number().min(-180).max(180, 'Invalid longitude'),
});

export const idParamSchema = z.uuid('Invalid scene ID format');

export const idsParamSchema = z.array(z.uuid()).min(1, 'At least one ID is required');