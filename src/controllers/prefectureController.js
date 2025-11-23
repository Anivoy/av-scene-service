import prefectureService from '../services/prefectureService.js';
import {
  createPrefectureSchema,
  updatePrefectureSchema,
  idParamSchema,
  idsParamSchema,
  listPrefecturesQuerySchema
} from '../validations/prefectureValidation.js';

export async function createPrefecture(req, res, next) {
  try {
    const validatedData = createPrefectureSchema.parse(req.body);

    const prefecture = await prefectureService.createPrefecture(validatedData);

    return res.status(201).json({
      success: true,
      message: 'Prefecture created successfully',
      data: prefecture
    })
  } catch (error) {
    next(error);
  }
};

export async function listPrefectures(req, res, next) {
  try {
    const validatedQuery = listPrefecturesQuerySchema.parse(req.query);

    const result = await prefectureService.listPrefectures(validatedQuery);

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    })
  } catch (error) {
    next(error);
  }
};

export async function getPrefectureById(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);

    const result = await prefectureService.getPrefectureById(validatedId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export async function getPrefectureByIds(req, res, next) {
  try {
    const validatedIds = idsParamSchema.parse(req.body.ids);

    const result = await prefectureService.getPrefectureByIds(validatedIds)

    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

export async function updatePrefecture(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);

    const validatedData = updatePrefectureSchema.parse(req.body);

    const prefecture = await prefectureService.updatePrefecture(validatedId, validatedData);

    return res.status(200).json({
      success: true,
      message: 'Prefecture updated successfully',
      data: prefecture,
    })
  } catch (error) {
    next(error);
  }
};

export async function deletePrefecture(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);

    const result = await prefectureService.deletePrefecture(validatedId);

    return res.status(200).json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    next(error);
  }
};

export async function deleteMultiplePrefectures(req, res, next) {
  try {
    const validatedIds = idsParamSchema.parse(req.body.ids);

    const result = await prefectureService.deleteMultiplePrefectures(validatedIds);

    return res.status(200).json({
      success: true,
      message: result.message,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
