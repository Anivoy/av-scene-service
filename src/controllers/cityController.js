import cityService from '../services/cityService.js';
import {
  createCitySchema,
  updateCitySchema,
  idParamSchema,
  idsParamSchema,
  listCitiesQuerySchema
} from '../validations/cityValidation.js';

export async function createCity(req, res, next) {
  try {
    const validatedData = createCitySchema.parse(req.body);

    const city = await cityService.createCity(validatedData);

    return res.status(201).json({
      success: true,
      message: 'City created successfully',
      data: city
    })
  } catch (error) {
    next(error);
  }
};

export async function listCities(req, res, next) {
  try {
    const validatedQuery = listCitiesQuerySchema.parse(req.query);

    const result = await cityService.listCities(validatedQuery);

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    })
  } catch (error) {
    next(error);
  }
};

export async function getCityById(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);

    const result = await cityService.getCityById(validatedId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export async function getCityByIds(req, res, next) {
  try {
    const validatedIds = idsParamSchema.parse(req.body.ids);

    const result = await cityService.getCityByIds(validatedIds)

    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

export async function updateCity(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);

    const validatedData = updateCitySchema.parse(req.body);

    const city = await cityService.updateCity(validatedId, validatedData);

    return res.status(200).json({
      success: true,
      message: 'City updated successfully',
      data: city,
    })
  } catch (error) {
    next(error);
  }
};

export async function deleteCity(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);

    const result = await cityService.deleteCity(validatedId);

    return res.status(200).json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    next(error);
  }
};

export async function deleteMultipleCities(req, res, next) {
  try {
    const validatedIds = idsParamSchema.parse(req.body.ids);

    const result = await cityService.deleteMultipleCities(validatedIds);

    return res.status(200).json({
      success: true,
      message: result.message,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
