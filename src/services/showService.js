import prisma from '../db/index.js';

import { logger } from '../config/logger.js';
import { AppError } from '../utils/errorUtility.js';

async function createShow(data) {
  logger.info('Creating new show', { title: data.title });

  const existingShow = await prisma.show.findUnique({
    where: { title: data.title },
  });

  if (existingShow) {
    logger.warn('Show with this title already exists', { title: data.title });
    throw new AppError('Show with this title already exists', 400);
  }

  const show = await prisma.show.create({
    data: {
      title: data.title,
      alternativeTitle: data.alternativeTitle,
      synopsis: data.synopsis,
      type: data.type,
      difficultyId: data.difficultyId || null,
      seasonId: data.seasonId || null,
      genres: data.genreIds
        ? { connect: data.genreIds.map((id) => ({ id })) }
        : undefined,
    },
    include: {
      genres: true,
      difficulty: true,
      season: true,
    },
  });

  logger.info('Show created successfully', { id: show.id });
  return show;
}

async function getShowById(id) {
  logger.info('Fetching show by id', { id });

  const show = await prisma.show.findUnique({
    where: { id },
    include: {
      genres: true,
      difficulty: true,
      season: true,
    },
  });

  if (!show) {
    logger.warn('Show not found', { id });
    throw new AppError('Show not found', 404);
  }

  return show;
}

async function getShowByIds(ids) {
  logger.info('Fetching shows by ids', { ids });

  const shows = await prisma.show.findMany({
    where: { id: { in: ids } },
    include: {
      genres: true,
      difficulty: true,
      season: true,
    },
  });

  if (!shows.length) {
    logger.warn('Shows not found', { ids });
    throw new AppError('Shows not found', 404);
  }

  return shows;
}

async function listShows(query) {
  const {
    page = 1,
    limit = 10,
    type,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    title,
    alternativeTitle,
    difficultyName,
    seasonName,
    seasonYear,
    seasonQuarter,
    genreName,
  } = query;

  const skip = (page - 1) * limit;

  const where = {
    AND: [
      search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { alternativeTitle: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      title ? { title: { contains: title, mode: 'insensitive' } } : undefined,
      alternativeTitle
        ? { alternativeTitle: { contains: alternativeTitle, mode: 'insensitive' } }
        : undefined,
      type ? { type } : undefined,
      difficultyName
        ? { difficulty: { name: { contains: difficultyName, mode: 'insensitive' } } }
        : undefined,
      seasonName
        ? { season: { name: { contains: seasonName, mode: 'insensitive' } } }
        : undefined,
      seasonYear ? { season: { year: Number(seasonYear) } } : undefined,
      seasonQuarter ? { season: { quarter: seasonQuarter } } : undefined,
      genreName
        ? {
            genres: {
              some: {
                name: {
                  in: Array.isArray(genreName)
                    ? genreName.map((g) => g.trim())
                    : genreName
                        .split(',')
                        .map((g) => g.trim())
                        .filter(Boolean),
                  mode: 'insensitive',
                },
              },
            },
          }
        : undefined,
    ].filter(Boolean),
  };

  const allowedSortFields = [
    'title',
    'type',
    'createdAt',
    'updatedAt',
    'alternativeTitle',
  ];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

  const [shows, total] = await Promise.all([
    prisma.show.findMany({
      where,
      select: {
        id: true,
        title: true,
        alternativeTitle: true,
        synopsis: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        difficulty: {
          select: {
            id: true,
            name: true,
            colorCode: true,
          },
        },
        season: {
          select: {
            id: true,
            name: true,
            year: true,
            quarter: true,
          },
        },
        genres: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { [safeSortBy]: sortOrder },
    }),
    prisma.show.count({ where }),
  ]);

  logger.info('Shows fetched successfully', { count: shows.length, total });

  return {
    data: shows,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function updateShow(id, data) {
  logger.info('Updating show', { id, data });

  const existingShow = await prisma.show.findUnique({
    where: { id },
    include: { genres: true, difficulty: true, season: true },
  });

  if (!existingShow) {
    logger.warn('Show not found', { id });
    throw new AppError('Show not found', 404);
  }

  if (data.title && data.title !== existingShow.title) {
    const duplicate = await prisma.show.findUnique({
      where: { title: data.title },
    });
    if (duplicate) {
      logger.warn('Show with this title already exists', { title: data.title });
      throw new AppError('Show with this title already exists', 400);
    }
  }

  const updated = await prisma.show.update({
    where: { id },
    data: {
      title: data.title ?? existingShow.title,
      alternativeTitle: data.alternativeTitle ?? existingShow.alternativeTitle,
      synopsis: data.synopsis ?? existingShow.synopsis,
      type: data.type ?? existingShow.type,
      difficultyId:
        data.difficultyId !== undefined ? data.difficultyId : existingShow.difficultyId,
      seasonId: data.seasonId !== undefined ? data.seasonId : existingShow.seasonId,
      genres:
        data.genreIds !== undefined
          ? {
              set: [],
              connect: data.genreIds.map((id) => ({ id })),
            }
          : undefined,
    },
    include: {
      genres: true,
      difficulty: true,
      season: true,
    },
  });

  logger.info('Show updated successfully', { id });
  return updated;
}

async function deleteShow(id) {
  logger.info('Deleting show', { id });

  const existingShow = await prisma.show.findUnique({ where: { id } });

  if (!existingShow) {
    logger.warn('Show not found', { id });
    throw new AppError('Show not found', 404);
  }

  await prisma.show.delete({ where: { id } });
  logger.info('Show deleted successfully', { id });

  return { message: 'Show deleted successfully' };
}

async function deleteMultipleShows(ids) {
  logger.info('Deleting multiple shows', { ids });

  const deleted = await prisma.show.deleteMany({
    where: { id: { in: ids } },
  });

  if (!deleted.count) {
    logger.warn('No shows found with provided IDs');
    throw new AppError('No shows found with provided IDs', 404);
  }

  logger.info('Shows deleted successfully', { deletedCount: deleted.count });

  return {
    message: `${deleted.count} show(s) deleted successfully`,
    deletedCount: deleted.count,
  };
}

export default {
  createShow,
  listShows,
  getShowById,
  getShowByIds,
  updateShow,
  deleteShow,
  deleteMultipleShows,
};
