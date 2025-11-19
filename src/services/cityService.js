import prisma from "../db/index.js"

import { logger } from '../config/logger.js';
import { AppError } from '../utils/errorUtility.js';

async function createCity(data) {
  logger.info('Creating new city', { name: data.name });

  const existing = await prisma.city.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    logger.warn('City with this name already exists', { name: data.name });
    throw new AppError('City with this name already exists', 400);
  }

  const city = await prisma.city.create({
    data: {
      name: data.name,
      prefectureId: data.prefectureId,
    },
  });

  logger.info('City created successfully', { id: city.id });
  return city;
}

async function getCityById(id) {
  logger.info('Fetching city by id', { id });

  const city = await prisma.city.findUnique({
    where: { id },
  });

  if (!city) {
    logger.warn('City not found', { id });
    throw new AppError('City not found', 404);
  }

  return city;
}

async function getCityByIds(ids) {
  logger.info('Fetching cities by ids', { ids });

  const cities = await prisma.city.findMany({
    where: { id: { in: ids } },
  });

  if (!cities.length) {
    logger.warn('Cities not found', { ids });
    throw new AppError('Cities not found', 404);
  }

  return cities;
}

async function listCities(query) {
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

  const [cities, total] = await Promise.all([
    prisma.city.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.city.count({ where }),
  ]);

  logger.info('Cities fetched successfully', { count: cities.length, total });

  return {
    data: cities,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function updateCity(id, data) {
  logger.info('Updating city', { id, data });

  const city = await prisma.city.findUnique({ where: { id } });
  if (!city) throw new AppError('City not found', 404);

  if (data.name && data.name !== city.name) {
    const existing = await prisma.city.findUnique({ where: { name: data.name } });
    if (existing) {
      throw new AppError('City with this name already exists', 400);
    }
  }

  const updated = await prisma.city.update({
    where: { id },
    data: {
      name: data.name ?? city.name,
      prefectureId: data.prefectureId ?? city.prefectureId
    },
  });

  logger.info('City updated successfully', { id });
  return updated;
}

async function deleteCity(id) {
  logger.info('Deleting city', { id });

  const city = await prisma.city.findUnique({ where: { id } });
  if (!city) throw new AppError('City not found', 404);

  await prisma.city.delete({ where: { id } });

  logger.info('City deleted successfully', { id });
  return { message: 'City deleted successfully' };
}

async function deleteMultipleCities(ids) {
  logger.info('Deleting multiple cities', { ids, count: ids.length });

  const result = await prisma.city.deleteMany({
    where: { id: { in: ids } },
  });

  if (result.count === 0) throw new AppError('No cities found with provided IDs', 404);

  logger.info('Cities deleted successfully', { deletedCount: result.count });

  return {
    message: `${result.count} city(s) deleted successfully`,
    deletedCount: result.count,
  };
}

export default {
  createCity,
  getCityById,
  getCityByIds,
  listCities,
  updateCity,
  deleteCity,
  deleteMultipleCities,
};
