import sceneService from '../services/sceneService.js';
import {
  createSceneSchema,
  updateSceneSchema,
  idParamSchema,
  idsParamSchema,
  listScenesQuerySchema,
} from '../validations/sceneValidation.js';

export async function createScene(req, res, next) {
  try {
    const validatedData = createSceneSchema.parse(req.body);
    const scene = await sceneService.createScene(validatedData, req.files);
    return res.status(201).json({
      success: true,
      message: 'Scene created successfully',
      data: scene,
    });
  } catch (error) {
    next(error);
  }
}

export async function listScenes(req, res, next) {
  try {
    const validatedQuery = listScenesQuerySchema.parse(req.query);
    const result = await sceneService.listScenes(validatedQuery);
    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSceneById(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);
    const minimal = req.query.minimal === 'true';
    const result = await sceneService.getSceneById(validatedId, { minimal });
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSceneByIds(req, res, next) {
  try {
    const validatedIds = idsParamSchema.parse(req.body.ids);
    const minimal = req.query.minimal === 'true';
    const result = await sceneService.getSceneByIds(validatedIds, { minimal });
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateScene(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);
    const validatedData = updateSceneSchema.parse(req.body);
    const scene = await sceneService.updateScene(validatedId, validatedData, req.files);
    return res.status(200).json({
      success: true,
      message: 'Scene updated successfully',
      data: scene,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteScene(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);
    const result = await sceneService.deleteScene(validatedId);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteMultipleScenes(req, res, next) {
  try {
    const validatedIds = idsParamSchema.parse(req.body.ids);
    const result = await sceneService.deleteMultipleScenes(validatedIds);
    return res.status(200).json({
      success: true,
      message: result.message,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
}
