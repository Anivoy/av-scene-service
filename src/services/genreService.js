import prisma from "../db/index.js"

import { logger } from '../config/logger.js';
import { AppError } from '../utils/errorUtility.js';

async function createGenre(data) {
  logger.info('Creating new genre', { name: data.name });

  const existing = await prisma.genre.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    logger.warn('Genre with this name already exists', { name: data.name });
    throw new AppError('Genre with this name already exists', 400);
  }

  const genre = await prisma.genre.create({
    data: {
      name: data.name,
      description: data.description,
    },
  });

  logger.info('Genre created successfully', { id: genre.id });
  return genre;
}

async function getGenreById(id) {
  logger.info('Fetching genre by id', { id });

  const genre = await prisma.genre.findUnique({
    where: { id },
  });

  if (!genre) {
    logger.warn('Genre not found', { id });
    throw new AppError('Genre not found', 404);
  }

  return genre;
}

async function getGenreByIds(ids) {
  logger.info('Fetching genres by ids', { ids });

  const genres = await prisma.genre.findMany({
    where: { id: { in: ids } },
  });

  if (!genres.length) {
    logger.warn('Genres not found', { ids });
    throw new AppError('Genres not found', 404);
  }

  return genres;
}

async function listGenres(query) {
  const {
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [genres, total] = await Promise.all([
    prisma.genre.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.genre.count({ where }),
  ]);

  logger.info('Genres fetched successfully', { count: genres.length, total });

  return {
    data: genres,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function updateGenre(id, data) {
  logger.info('Updating genre', { id, data });

  const genre = await prisma.genre.findUnique({ where: { id } });
  if (!genre) throw new AppError('Genre not found', 404);

  if (data.name && data.name !== genre.name) {
    const existing = await prisma.genre.findUnique({ where: { name: data.name } });
    if (existing) {
      throw new AppError('Genre with this name already exists', 400);
    }
  }

  const updated = await prisma.genre.update({
    where: { id },
    data: {
      name: data.name ?? genre.name,
      description: data.description ?? genre.description,
    },
  });

  logger.info('Genre updated successfully', { id });
  return updated;
}

async function deleteGenre(id) {
  logger.info('Deleting genre', { id });

  const genre = await prisma.genre.findUnique({ where: { id } });
  if (!genre) throw new AppError('Genre not found', 404);

  await prisma.genre.delete({ where: { id } });

  logger.info('Genre deleted successfully', { id });
  return { message: 'Genre deleted successfully' };
}

async function deleteMultipleGenres(ids) {
  logger.info('Deleting multiple genres', { ids, count: ids.length });

  const result = await prisma.genre.deleteMany({
    where: { id: { in: ids } },
  });

  if (result.count === 0) throw new AppError('No genres found with provided IDs', 404);

  logger.info('Genres deleted successfully', { deletedCount: result.count });

  return {
    message: `${result.count} genre(s) deleted successfully`,
    deletedCount: result.count,
  };
}

export default {
  createGenre,
  getGenreById,
  getGenreByIds,
  listGenres,
  updateGenre,
  deleteGenre,
  deleteMultipleGenres,
};
