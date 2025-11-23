import prisma from "../db/index.js"

import { logger } from '../config/logger.js';
import { AppError } from '../utils/errorUtility.js';

async function createRegion(data) {
  logger.info('Creating new region', { name: data.name });

  const existing = await prisma.region.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    logger.warn('Region with this name already exists', { name: data.name });
    throw new AppError('Region with this name already exists', 400);
  }

  const region = await prisma.region.create({
    data: {
      name: data.name,
      description: data.description,
    },
  });

  logger.info('Region created successfully', { id: region.id });
  return region;
}

async function getRegionById(id) {
  logger.info('Fetching region by id', { id });

  const region = await prisma.region.findUnique({
    where: { id },
  });

  if (!region) {
    logger.warn('Region not found', { id });
    throw new AppError('Region not found', 404);
  }

  return region;
}

async function getRegionByIds(ids) {
  logger.info('Fetching regions by ids', { ids });

  const regions = await prisma.region.findMany({
    where: { id: { in: ids } },
  });

  if (!regions.length) {
    logger.warn('Regions not found', { ids });
    throw new AppError('Regions not found', 404);
  }

  return regions;
}

async function listRegions(query) {
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

  const [regions, total] = await Promise.all([
    prisma.region.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.region.count({ where }),
  ]);

  logger.info('Regions fetched successfully', { count: regions.length, total });

  return {
    data: regions,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function updateRegion(id, data) {
  logger.info('Updating region', { id, data });

  const region = await prisma.region.findUnique({ where: { id } });
  if (!region) throw new AppError('Region not found', 404);

  if (data.name && data.name !== region.name) {
    const existing = await prisma.region.findUnique({ where: { name: data.name } });
    if (existing) {
      throw new AppError('Region with this name already exists', 400);
    }
  }

  const updated = await prisma.region.update({
    where: { id },
    data: {
      name: data.name ?? region.name,
      description: data.description ?? region.description,
    },
  });

  logger.info('Region updated successfully', { id });
  return updated;
}

async function deleteRegion(id) {
  logger.info('Deleting region', { id });

  const region = await prisma.region.findUnique({ where: { id } });
  if (!region) throw new AppError('Region not found', 404);

  await prisma.region.delete({ where: { id } });

  logger.info('Region deleted successfully', { id });
  return { message: 'Region deleted successfully' };
}

async function deleteMultipleRegions(ids) {
  logger.info('Deleting multiple regions', { ids, count: ids.length });

  const result = await prisma.region.deleteMany({
    where: { id: { in: ids } },
  });

  if (result.count === 0) throw new AppError('No regions found with provided IDs', 404);

  logger.info('Regions deleted successfully', { deletedCount: result.count });

  return {
    message: `${result.count} region(s) deleted successfully`,
    deletedCount: result.count,
  };
}

export default {
  createRegion,
  getRegionById,
  getRegionByIds,
  listRegions,
  updateRegion,
  deleteRegion,
  deleteMultipleRegions,
};
