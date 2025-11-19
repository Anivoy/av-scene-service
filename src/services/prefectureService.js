import prisma from "../db/index.js"

import { logger } from '../config/logger.js';
import { AppError } from '../utils/errorUtility.js';

async function createPrefecture(data) {
  logger.info('Creating new prefecture', { name: data.name });

  const existing = await prisma.prefecture.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    logger.warn('Prefecture with this name already exists', { name: data.name });
    throw new AppError('Prefecture with this name already exists', 400);
  }

  const prefecture = await prisma.prefecture.create({
    data: {
      name: data.name,
      regionId: data.regionId,
    },
  });

  logger.info('Prefecture created successfully', { id: prefecture.id });
  return prefecture;
}

async function getPrefectureById(id) {
  logger.info('Fetching prefecture by id', { id });

  const prefecture = await prisma.prefecture.findUnique({
    where: { id },
  });

  if (!prefecture) {
    logger.warn('Prefecture not found', { id });
    throw new AppError('Prefecture not found', 404);
  }

  return prefecture;
}

async function getPrefectureByIds(ids) {
  logger.info('Fetching prefectures by ids', { ids });

  const prefectures = await prisma.prefecture.findMany({
    where: { id: { in: ids } },
  });

  if (!prefectures.length) {
    logger.warn('Prefectures not found', { ids });
    throw new AppError('Prefectures not found', 404);
  }

  return prefectures;
}

async function listPrefectures(query) {
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
        ],
      }
    : {};

  const [prefectures, total] = await Promise.all([
    prisma.prefecture.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.prefecture.count({ where }),
  ]);

  logger.info('Prefectures fetched successfully', { count: prefectures.length, total });

  return {
    data: prefectures,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function updatePrefecture(id, data) {
  logger.info('Updating prefecture', { id, data });

  const prefecture = await prisma.prefecture.findUnique({ where: { id } });
  if (!prefecture) throw new AppError('Prefecture not found', 404);

  if (data.name && data.name !== prefecture.name) {
    const existing = await prisma.prefecture.findUnique({ where: { name: data.name } });
    if (existing) {
      throw new AppError('Prefecture with this name already exists', 400);
    }
  }

  const updated = await prisma.prefecture.update({
    where: { id },
    data: {
      name: data.name ?? prefecture.name,
      regionId: data.regionId ?? prefecture.regionId
    },
  });

  logger.info('Prefecture updated successfully', { id });
  return updated;
}

async function deletePrefecture(id) {
  logger.info('Deleting prefecture', { id });

  const prefecture = await prisma.prefecture.findUnique({ where: { id } });
  if (!prefecture) throw new AppError('Prefecture not found', 404);

  await prisma.prefecture.delete({ where: { id } });

  logger.info('Prefecture deleted successfully', { id });
  return { message: 'Prefecture deleted successfully' };
}

async function deleteMultiplePrefectures(ids) {
  logger.info('Deleting multiple prefectures', { ids, count: ids.length });

  const result = await prisma.prefecture.deleteMany({
    where: { id: { in: ids } },
  });

  if (result.count === 0) throw new AppError('No prefectures found with provided IDs', 404);

  logger.info('Prefectures deleted successfully', { deletedCount: result.count });

  return {
    message: `${result.count} prefecture(s) deleted successfully`,
    deletedCount: result.count,
  };
}

export default {
  createPrefecture,
  getPrefectureById,
  getPrefectureByIds,
  listPrefectures,
  updatePrefecture,
  deletePrefecture,
  deleteMultiplePrefectures,
};
