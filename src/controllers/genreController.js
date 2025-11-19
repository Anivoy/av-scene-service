import genreService from '../services/genreService.js';
import {
  createGenreSchema,
  updateGenreSchema,
  idParamSchema,
  idsParamSchema,
  listGenresQuerySchema
} from '../validations/genreValidation.js';

export async function createGenre(req, res, next) {
  try {
    const validatedData = createGenreSchema.parse(req.body);

    const genre = await genreService.createGenre(validatedData);

    return res.status(201).json({
      success: true,
      message: 'Genre created successfully',
      data: genre
    })
  } catch (error) {
    next(error);
  }
};

export async function listGenres(req, res, next) {
  try {
    const validatedQuery = listGenresQuerySchema.parse(req.query);

    const result = await genreService.listGenres(validatedQuery);

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    })
  } catch (error) {
    next(error);
  }
};

export async function getGenreById(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);

    const result = await genreService.getGenreById(validatedId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export async function getGenreByIds(req, res, next) {
  try {
    const validatedIds = idsParamSchema.parse(req.body.ids);

    const result = await genreService.getGenreByIds(validatedIds)

    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

export async function updateGenre(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);

    const validatedData = updateGenreSchema.parse(req.body);

    const genre = await genreService.updateGenre(validatedId, validatedData);

    return res.status(200).json({
      success: true,
      message: 'Genre updated successfully',
      data: genre,
    })
  } catch (error) {
    next(error);
  }
};

export async function deleteGenre(req, res, next) {
  try {
    const validatedId = idParamSchema.parse(req.params.id);

    const result = await genreService.deleteGenre(validatedId);

    return res.status(200).json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    next(error);
  }
};

export async function deleteMultipleGenres(req, res, next) {
  try {
    const validatedIds = idsParamSchema.parse(req.body.ids);

    const result = await genreService.deleteMultipleGenres(validatedIds);

    return res.status(200).json({
      success: true,
      message: result.message,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
