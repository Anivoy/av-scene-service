import regionService from '../services/regionService.js';
import {
  createRegionSchema,
  updateRegionSchema,
  idParamSchema,
  idsParamSchema,
  listRegionsQuerySchema
} from '../validations/regionValidation.js';

export async function createRegion(req, res, next) {
  try {
    const validatedData = createRegionSchema.parse(req.body);

    const region = await regionService.createRegion(validatedData);

    return res.status(201).json({
      success: true,
      message: 'Region created successfully',
      data: region
    })
  } catch (error) {
    next(error);
  }
};

export async function listRegions(req, res, next) {
  try {
    const validatedQuery = listRegionsQuerySchema.parse(req.query);

    const result = await regionService.listRegions(validatedQuery);

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    })
  } catch (error) {
    next(error);
  }
};

export async function getRegionById(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);

    const result = await regionService.getRegionById(validatedId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export async function getRegionByIds(req, res, next) {
  try {
    const validatedIds = idsParamSchema.parse(req.body.ids);

    const result = await regionService.getRegionByIds(validatedIds)

    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

export async function updateRegion(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);

    const validatedData = updateRegionSchema.parse(req.body);

    const region = await regionService.updateRegion(validatedId, validatedData);

    return res.status(200).json({
      success: true,
      message: 'Region updated successfully',
      data: region,
    })
  } catch (error) {
    next(error);
  }
};

export async function deleteRegion(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);

    const result = await regionService.deleteRegion(validatedId);

    return res.status(200).json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    next(error);
  }
};

export async function deleteMultipleRegions(req, res, next) {
  try {
    const validatedIds = idsParamSchema.parse(req.body.ids);

    const result = await regionService.deleteMultipleRegions(validatedIds);

    return res.status(200).json({
      success: true,
      message: result.message,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
