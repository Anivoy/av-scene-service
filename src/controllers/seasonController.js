import seasonService from '../services/seasonService.js';
import {
  createSeasonSchema,
  updateSeasonSchema,
  idParamSchema,
  idsParamSchema,
  listSeasonsQuerySchema,
} from '../validations/seasonValidation.js';

export async function createSeason(req, res, next) {
  try {
    const validatedData = createSeasonSchema.parse(req.body);

    const season = await seasonService.createSeason(validatedData);

    return res.status(201).json({
      success: true,
      message: 'Season created successfully',
      data: season,
    });
  } catch (error) {
    next(error);
  }
}

export async function listSeasons(req, res, next) {
  try {
    const validatedQuery = listSeasonsQuerySchema.parse(req.query);

    const result = await seasonService.listSeasons(validatedQuery);

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSeasonById(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);

    const result = await seasonService.getSeasonById(validatedId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSeasonByIds(req, res, next) {
  try {
    const validatedIds = idsParamSchema.parse(req.body.ids);

    const result = await seasonService.getSeasonByIds(validatedIds);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSeason(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);
    const validatedData = updateSeasonSchema.parse(req.body);

    const season = await seasonService.updateSeason(validatedId, validatedData);

    return res.status(200).json({
      success: true,
      message: 'Season updated successfully',
      data: season,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSeason(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);

    const result = await seasonService.deleteSeason(validatedId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteMultipleSeasons(req, res, next) {
  try {
    const validatedIds = idsParamSchema.parse(req.body.ids);

    const result = await seasonService.deleteMultipleSeasons(validatedIds);

    return res.status(200).json({
      success: true,
      message: result.message,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
}
