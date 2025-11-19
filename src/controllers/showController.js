import showService from '../services/showService.js';
import {
  createShowSchema,
  updateShowSchema,
  idParamSchema,
  idsParamSchema,
  listShowsQuerySchema,
} from '../validations/showValidation.js';

export async function createShow(req, res, next) {
  try {
    const validatedData = createShowSchema.parse(req.body);

    const show = await showService.createShow(validatedData);

    return res.status(201).json({
      success: true,
      message: 'Show created successfully',
      data: show,
    });
  } catch (error) {
    next(error);
  }
};

export async function listShows(req, res, next) {
  try {
    const validatedQuery = listShowsQuerySchema.parse(req.query);

    const result = await showService.listShows(validatedQuery);

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export async function getShowById(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);

    const result = await showService.getShowById(validatedId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export async function getShowByIds(req, res, next) {
  try {
    const validatedIds = idsParamSchema.parse(req.body.ids);

    const result = await showService.getShowByIds(validatedIds)

    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

export async function updateShow(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);

    const validatedData = updateShowSchema.parse(req.body);

    const show = await showService.updateShow(validatedId, validatedData);

    return res.status(200).json({
      success: true,
      message: 'Show updated successfully',
      data: show,
    });
  } catch (error) {
    next(error);
  }
};

export async function deleteShow(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);

    const result = await showService.deleteShow(validatedId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export async function deleteMultipleShows(req, res, next) {
  try {
    const validatedIds = idsParamSchema.parse(req.body.ids);

    const result = await showService.deleteMultipleShows(validatedIds);

    return res.status(200).json({
      success: true,
      message: result.message,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};