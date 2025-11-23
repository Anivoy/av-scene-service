import prisma from '../db/index.js';

import { logger } from '../config/logger.js';
import { AppError } from '../utils/errorUtility.js';

async function createDifficulty(data) {
  logger.info('Creating new difficulty', { name: data.name });

  const existingDifficulty = await prisma.difficulty.findUnique({
    where: { name: data.name },
  });

  if (existingDifficulty) {
    logger.warn('Difficulty with this name already exists', { name: data.name });
    throw new AppError('Difficulty with this name already exists', 400);
  }

  const savedDifficulty = await prisma.difficulty.create({
    data: {
      name: data.name,
      description: data.description,
      colorCode: data.colorCode,
      multiplier: data.multiplier ?? 1.0,
    },
  });

  logger.info('Difficulty created successfully', { id: savedDifficulty.id });
  return savedDifficulty;
}

async function getDifficultyById(id) {
  logger.info('Fetching difficulty by id', { id });

  const difficulty = await prisma.difficulty.findUnique({
    where: { id },
  });

  if (!difficulty) {
    logger.warn('Difficulty not found', { id });
    throw new AppError('Difficulty not found', 404);
  }

  return difficulty;
}

async function getDifficultyByIds(ids) {
  logger.info('Fetching difficulties by ids', { ids });

  const difficulties = await prisma.difficulty.findMany({
    where: { id: { in: ids } },
  });

  if (difficulties.length === 0) {
    logger.warn('Difficulties not found', { ids });
    throw new AppError('Difficulties not found', 404);
  }

  return difficulties;
}

async function listDifficulties(query) {
  const {
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const fetchAll = !limit || limit === 0;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  if (fetchAll) {
    const difficulties = await prisma.difficulty.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
    });

    return { data: difficulties };
  }

  const skip = (page - 1) * limit;

  const [difficulties, total] = await Promise.all([
    prisma.difficulty.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.difficulty.count({ where }),
  ]);

  logger.info('Difficulties fetched successfully', {
    count: difficulties.length,
    total,
  });

  return {
    data: difficulties,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function updateDifficulty(id, data) {
  logger.info('Updating difficulty', { id, data });

  const difficulty = await prisma.difficulty.findUnique({ where: { id } });
  if (!difficulty) {
    logger.warn('Difficulty not found', { id });
    throw new AppError('Difficulty not found', 404);
  }

  if (data.name && data.name !== difficulty.name) {
    const existing = await prisma.difficulty.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      logger.warn('Difficulty with this name already exists', { name: data.name });
      throw new AppError('Difficulty with this name already exists', 400);
    }
  }

  const updated = await prisma.difficulty.update({
    where: { id },
    data: {
      name: data.name ?? difficulty.name,
      description: data.description ?? difficulty.description,
      colorCode: data.colorCode ?? difficulty.colorCode,
      multiplier: data.multiplier ?? difficulty.multiplier,
    },
  });

  logger.info('Difficulty updated successfully', { id });
  return updated;
}

async function deleteDifficulty(id) {
  logger.info('Deleting difficulty', { id });

  const difficulty = await prisma.difficulty.findUnique({ where: { id } });
  if (!difficulty) {
    logger.warn('Difficulty not found', { id });
    throw new AppError('Difficulty not found', 404);
  }

  await prisma.difficulty.delete({ where: { id } });
  logger.info('Difficulty deleted successfully', { id });

  return { message: 'Difficulty deleted successfully' };
}

async function deleteMultipleDifficulties(ids) {
  logger.info('Deleting multiple difficulties', { ids, count: ids.length });

  const { count } = await prisma.difficulty.deleteMany({
    where: { id: { in: ids } },
  });

  if (count === 0) {
    logger.warn('No difficulties found with provided IDs');
    throw new AppError('No difficulties found with provided IDs', 404);
  }

  logger.info('Difficulties deleted successfully', { deletedCount: count });

  return {
    message: `${count} difficulty(ies) deleted successfully`,
    deletedCount: count,
  };
}

export default {
  createDifficulty,
  getDifficultyById,
  getDifficultyByIds,
  listDifficulties,
  updateDifficulty,
  deleteDifficulty,
  deleteMultipleDifficulties,
};
