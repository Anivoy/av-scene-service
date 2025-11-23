import prisma from "../db/index.js"

import { logger } from '../config/logger.js';
import { AppError } from '../utils/errorUtility.js';

async function createSeason(data) {
  logger.info('Creating new season', { data });

  const existingSeason = await prisma.season.findUnique({
    where: {
      IDX_season_year_quarter: {
        year: data.year,
        quarter: data.quarter,
      },
    },
  });

  if (existingSeason) {
    throw new AppError('Season with this year and quarter already exists', 400);
  }

  const season = await prisma.season.create({
    data: {
      name: data.name || `${data.quarter} ${data.year}`,
      year: data.year,
      quarter: data.quarter,
    },
  });

  logger.info('Season created successfully', { id: season.id });
  return season;
}

async function getSeasonById(id) {
  logger.info('Fetching season by id', { id });

  const season = await prisma.season.findUnique({
    where: { id },
    include: { shows: true },
  });

  if (!season) throw new AppError('Season not found', 404);
  return season;
}

async function getSeasonByIds(ids) {
  logger.info('Fetching multiple seasons by ids', { ids });

  const seasons = await prisma.season.findMany({
    where: { id: { in: ids } },
    include: { shows: true },
  });

  if (!seasons.length) throw new AppError('Seasons not found', 404);
  return seasons;
}

async function listSeasons(query) {
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
          { quarter: { equals: search, mode: 'insensitive' } },
          {
            year: {
              equals: Number.isNaN(Number(search)) ? undefined : Number(search),
            },
          },
        ],
      }
    : {};

  if (fetchAll) {
    const seasons = await prisma.season.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
    });

    return { data: seasons };
  }

  const skip = (page - 1) * limit;

  const [seasons, total] = await Promise.all([
    prisma.season.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.season.count({ where }),
  ]);

  return {
    data: seasons,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function updateSeason(id, data) {
  logger.info('Updating season', { id, data });

  const season = await prisma.season.findUnique({ where: { id } });
  if (!season) throw new AppError('Season not found', 404);

  const year = data.year ?? season.year;
  const quarter = data.quarter ?? season.quarter;

  const existingSeason = await prisma.season.findUnique({
    where: {
      IDX_season_year_quarter: { year, quarter },
    },
  });

  if (existingSeason && existingSeason.id !== id) {
    throw new AppError('Season with this year and quarter already exists', 400);
  }

  const updated = await prisma.season.update({
    where: { id },
    data: {
      name: data.name ?? (data.year || data.quarter ? `${quarter} ${year}` : season.name),
      year,
      quarter,
    },
    include: { shows: true },
  });

  return updated;
}

async function deleteSeason(id) {
  logger.info('Deleting season', { id });

  const season = await prisma.season.findUnique({ where: { id } });
  if (!season) throw new AppError('Season not found', 404);

  await prisma.season.delete({ where: { id } });
  return { message: 'Season deleted successfully' };
}

async function deleteMultipleSeasons(ids) {
  logger.info('Deleting multiple seasons', { ids });

  const result = await prisma.season.deleteMany({
    where: { id: { in: ids } },
  });

  if (result.count === 0) throw new AppError('No seasons found with provided IDs', 404);

  return {
    message: `${result.count} season(s) deleted successfully`,
    deletedCount: result.count,
  };
}

export default {
  createSeason,
  getSeasonById,
  getSeasonByIds,
  listSeasons,
  updateSeason,
  deleteSeason,
  deleteMultipleSeasons,
};
