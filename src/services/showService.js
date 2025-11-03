import AppDataSource from '../db/index.js';
import { In } from 'typeorm';

import { Show } from '../entities/Show.js';
import { Genre } from '../entities/Genre.js';
import { Difficulty } from '../entities/Difficulty.js';
import { Season } from '../entities/Season.js';

import { logger } from '../config/logger.js';
import { AppError } from '../utils/errorUtility.js'

export async function createShow(data) {
  logger.info('Creating new show', { title: data.title });

  const showRepository = AppDataSource.getRepository(Show);
  const genreRepository = AppDataSource.getRepository(Genre);
  const difficultyRepository = AppDataSource.getRepository(Difficulty);
  const seasonRepository = AppDataSource.getRepository(Season);

  const existingShow = await showRepository.findOne({
    where: { title: data.title },
  });

  if (existingShow) {
    logger.warn('Show with this title already exists', { title: data.title });
    throw new AppError('Show with this title already exists', 400);
  }

  const show = showRepository.create({
    title: data.title,
    alternativeTitle: data.alternativeTitle,
    synopsis: data.synopsis,
    type: data.type,
  });

  if (data.genreIds && data.genreIds.length > 0) {
    const genres = await genreRepository.findBy({
      id: In(data.genreIds),
    });
    show.genres = genres;
  }

  if (data.difficultyId) {
    const difficulty = await difficultyRepository.findOne({
      where: { id: data.difficultyId },
    });
    if (difficulty) {
      show.difficulty = difficulty;
    }
  }

  if (data.seasonId) {
    const season = await seasonRepository.findOne({
      where: { id: data.seasonId },
    });
    if (season) {
      show.season = season;
    }
  }

  const savedShow = await showRepository.save(show);
  logger.info('Show created successfully', { id: savedShow.id });

  return showRepository.findOne({
    where: { id: savedShow.id },
    relations: ['genres', 'difficulty', 'season'],
  });
};

export async function getShowById(id) {
  logger.info('Fetching show by id', { id });

  const showRepository = AppDataSource.getRepository(Show);

  const show = await showRepository.findOne({
    where: { id },
    relations: ['genres', 'difficulty', 'season'],
  });

  if (!show) {
    logger.warn('Show not found', { id });
    throw new AppError('Show not found', 400);
  }

  return show;
};

export async function getShowByIds(ids) {
  logger.info('Fetching show by ids', { ids });

  const showRepository = AppDataSource.getRepository(Show);

  const shows = await showRepository.find({
    where: In(ids),
    relations: ['genres', 'difficulty', 'season'],
  });

  if (shows === 0) {
    logger.warn('Shows not found', { ids });
    throw new AppError('Shows not found', 404);
  }

  return shows;
}

export async function listShows(query) {
  logger.info('Listing shows', { query });

  const showRepository = AppDataSource.getRepository(Show);

  const { page, limit, search, type, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const queryBuilder = showRepository
    .createQueryBuilder('show')
    .leftJoinAndSelect('show.genres', 'genres')
    .leftJoinAndSelect('show.difficulty', 'difficulty')
    .leftJoinAndSelect('show.season', 'season');

  if (search) {
    queryBuilder.where(
      '(show.title ILIKE :search OR show.alternativeTitle ILIKE :search)',
      { search: `%${search}%` }
    );
  }

  if (type) {
    queryBuilder.andWhere('show.type = :type', { type });
  }

  queryBuilder
    .orderBy(`show.${sortBy}`, sortOrder)
    .skip(skip)
    .take(limit);

  const [shows, total] = await queryBuilder.getManyAndCount();

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
};

export async function updateShow(id, data) {
  logger.info('Updating show', { id, data });

  const showRepository = AppDataSource.getRepository(Show);
  const genreRepository = AppDataSource.getRepository(Genre);
  const difficultyRepository = AppDataSource.getRepository(Difficulty);
  const seasonRepository = AppDataSource.getRepository(Season);

  const show = await showRepository.findOne({
    where: { id },
    relations: ['genres', 'difficulty', 'season'],
  });

  if (!show) {
    logger.warn('Show not found', { id });
    throw new AppError('Show not found', 404);
  }

  if (data.title && data.title !== show.title) {
    const existingShow = await showRepository.findOne({
      where: { title: data.title },
    });

    if (existingShow) {
      logger.warn('Show with this title already exists', { title: data.title });
      throw new AppError('Show with this title already exists', 400);
    }
  }

  if (data.title !== undefined) show.title = data.title;
  if (data.alternativeTitle !== undefined) show.alternativeTitle = data.alternativeTitle;
  if (data.synopsis !== undefined) show.synopsis = data.synopsis;
  if (data.type !== undefined) show.type = data.type;

  if (data.genreIds !== undefined) {
    if (data.genreIds.length > 0) {
      const genres = await genreRepository.findBy({
        id: In(data.genreIds),
      });
      show.genres = genres;
    } else {
      show.genres = [];
    }
  }

  if (data.difficultyId !== undefined) {
    if (data.difficultyId) {
      const difficulty = await difficultyRepository.findOne({
        where: { id: data.difficultyId },
      });
      show.difficulty = difficulty || null;
    } else {
      show.difficulty = null;
    }
  }

  if (data.seasonId !== undefined) {
    if (data.seasonId) {
      const season = await seasonRepository.findOne({
        where: { id: data.seasonId },
      });
      show.season = season || null;
    } else {
      show.season = null;
    }
  }

  await showRepository.save(show);
  logger.info('Show updated successfully', { id });

  return showRepository.findOne({
    where: { id },
    relations: ['genres', 'difficulty', 'season'],
  });
};

export async function deleteShow(id) {
  logger.info('Deleting show', { id });

  const showRepository = AppDataSource.getRepository(Show);

  const show = await showRepository.findOne({
    where: { id },
  });

  if (!show) {
    logger.warn('Show not found', { id });
    throw new AppError('Show not found', 404);
  }

  await showRepository.remove(show);
  logger.info('Show deleted successfully', { id });

  return { message: 'Show deleted successfully' };
};

export async function deleteMultipleShows(ids) {
  logger.info('Deleting multiple shows', { ids, count: ids.length });

  const showRepository = AppDataSource.getRepository(Show);

  const shows = await showRepository.findBy({
    id: In(ids),
  });

  if (shows.length === 0) {
    logger.warn('No shows found with provided IDs');
    throw new AppError('No shows found with provided IDs', 404);
  }

  await showRepository.remove(shows);
  logger.info('Shows deleted successfully', { deletedCount: shows.length });

  return {
    message: `${shows.length} show(s) deleted successfully`,
    deletedCount: shows.length,
  };
};
