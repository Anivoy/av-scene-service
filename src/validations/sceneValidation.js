
import { z } from 'zod';

export const sceneSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  difficulty: z.string().optional(),
  genre: z.string().optional(),
  geoData: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
});
