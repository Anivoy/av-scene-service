import sceneService from '../services/sceneService.js';
import {
  getRandomScenesSchema,
  calculateDistanceSchema,
} from '../validations/sceneValidation.js';

/**
 * Get random scenes for game loop
 * POST /api/game/scenes/random
 * Body: {
 *   count: number,
 *   difficultyWeights: [{ difficultyId: string, weight: number }],
 *   showId?: string,
 *   cityId?: string,
 *   prefectureId?: string,
 *   regionId?: string,
 *   excludeSceneIds?: string[]
 * }
 */
export async function getRandomScenes(req, res, next) {
  try {
    const validatedData = getRandomScenesSchema.parse(req.body);
    const scenes = await sceneService.getRandomScenes(validatedData);
    return res.status(200).json({
      success: true,
      data: scenes,
      meta: {
        count: scenes.length,
        requestedCount: validatedData.count,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Calculate distance between guess and actual scene location
 * POST /api/game/scenes/calculate-distance
 * Body: {
 *   sceneId: string,
 *   guessLatitude: number,
 *   guessLongitude: number
 * }
 */
export async function calculateDistance(req, res, next) {
  try {
    const validatedData = calculateDistanceSchema.parse(req.body);
    const result = await sceneService.calculateDistance(
      validatedData.sceneId,
      validatedData.guessLatitude,
      validatedData.guessLongitude,
    );
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
