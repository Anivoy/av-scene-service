import difficultyService from '../services/difficultyService.js';
import {
  createDifficultySchema,
  updateDifficultySchema,
  idParamSchema,
  idsParamSchema,
  listDifficultiesQuerySchema
} from '../validations/difficultyValidation.js';

export async function createDifficulty(req, res, next) {
  try {
    const validatedData = createDifficultySchema.parse(req.body);

    const difficulty = await difficultyService.createDifficulty(validatedData);

    return res.status(201).json({
      success: true,
      message: 'Difficulty created successfully',
      data: difficulty
    })
  } catch (error) {
    next(error);
  }
};

export async function listDifficulties(req, res, next) {
  try {
    const validatedQuery = listDifficultiesQuerySchema.parse(req.query);

    const result = await difficultyService.listDifficulties(validatedQuery);

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    })
  } catch (error) {
    next(error);
  }
};

export async function getDifficultyById(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);

    const result = await difficultyService.getDifficultyById(validatedId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export async function getDifficultyByIds(req, res, next) {
  try {
    const validatedIds = idsParamSchema.parse(req.body.ids);

    const result = await difficultyService.getDifficultyByIds(validatedIds)

    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

export async function updateDifficulty(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);

    const validatedData = updateDifficultySchema.parse(req.body);

    const difficulty = await difficultyService.updateDifficulty(validatedId, validatedData);

    return res.status(200).json({
      success: true,
      message: 'Difficulty updated successfully',
      data: difficulty,
    })
  } catch (error) {
    next(error);
  }
};

export async function deleteDifficulty(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);

    const result = await difficultyService.deleteDifficulty(validatedId);

    return res.status(200).json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    next(error);
  }
};

export async function deleteMultipleDifficulties(req, res, next) {
  try {
    const validatedIds = idsParamSchema.parse(req.body.ids);

    const result = await difficultyService.deleteMultipleDifficulties(validatedIds);

    return res.status(200).json({
      success: true,
      message: result.message,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
