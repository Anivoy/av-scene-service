import prisma from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { logger } from '../config/logger.js';
import { AppError } from '../utils/errorUtility.js';
import { uploadFiles, deleteFiles, populateSignedUrls } from '../utils/fileUtility.js';
import { shuffleArray } from '../utils/fisherShuffler.js';

async function createScene(data, files = []) {
  logger.info('Creating new scene', { name: data.name });

  const existingScene = await prisma.scene.findFirst({
    where: {
      name: data.name,
      showId: data.showId,
    },
  });

  if (existingScene) {
    logger.warn('Scene with this name already exists for this show', {
      name: data.name,
      showId: data.showId,
    });
    throw new AppError('Scene with this name already exists for this show', 400);
  }

  if (data.cityId || data.prefectureId || data.regionId) {
    const [city, prefecture, region] = await Promise.all([
      data.cityId ? prisma.city.findUnique({ where: { id: data.cityId } }) : null,
      data.prefectureId
        ? prisma.prefecture.findUnique({ where: { id: data.prefectureId } })
        : null,
      data.regionId ? prisma.region.findUnique({ where: { id: data.regionId } }) : null,
    ]);

    if (data.cityId && !city) throw new AppError('City not found', 400);

    if (data.prefectureId && !prefecture) throw new AppError('Prefecture not found', 400);

    if (data.regionId && !region) throw new AppError('Region not found', 400);

    if (city && data.prefectureId && city.prefectureId !== data.prefectureId) {
      throw new AppError('City does not belong to the given prefecture', 400);
    }

    if (prefecture && data.regionId && prefecture.regionId !== data.regionId) {
      throw new AppError('Prefecture does not belong to the given region', 400);
    }
  }

  const sceneId = uuidv4();

  let uploadedPaths = [];
  if (files && files.length > 0) {
    const filesWithSecureNames = files.map((file) => {
      const ext = path.extname(file.originalname);
      return {
        ...file,
        originalname: `${uuidv4()}${ext}`,
      };
    });

    uploadedPaths = await uploadFiles(
      filesWithSecureNames,
      `scenes/${data.showId}/${sceneId}`,
    );
  }

  try {
    const scene = await prisma.scene.create({
      data: {
        id: sceneId,
        name: data.name,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        showId: data.showId,
        difficultyId: data.difficultyId,
        cityId: data.cityId || null,
        prefectureId: data.prefectureId || null,
        regionId: data.regionId || null,
        images:
          uploadedPaths.length > 0
            ? {
                create: uploadedPaths.map((path, index) => ({
                  path,
                  alt: data.imageAlts?.[index] || null,
                })),
              }
            : undefined,
      },
      include: {
        show: true,
        difficulty: true,
        city: true,
        prefecture: true,
        region: true,
        images: true,
      },
    });

    logger.info('Scene created successfully', { id: scene.id });
    return scene;
  } catch (error) {
    if (uploadedPaths.length > 0) {
      logger.warn('Scene creation failed, cleaning up uploaded files');
      await deleteFiles(uploadedPaths);
    }
    throw error;
  }
}

async function getSceneById(id, { minimal = false }) {
  logger.info('Fetching scene by id', { id, minimal });

  let select;

  if (minimal) {
    select = {
      id: true,
      images: {
        select: { path: true, alt: true },
      },
    };
  } else {
    select = {
      id: true,
      name: true,
      description: true,
      latitude: true,
      longitude: true,
      show: {
        select: {
          id: true,
          title: true,
          alternativeTitle: true,
          synopsis: true,
          genres: {
            select: { id: true, name: true },
          },
        },
      },
      difficulty: {
        select: { id: true, name: true, colorCode: true },
      },
      city: {
        select: { id: true, name: true },
      },
      prefecture: {
        select: { id: true, name: true },
      },
      region: {
        select: { id: true, name: true },
      },
      images: {
        select: { id: true, path: true, alt: true },
      },
    };
  }

  const scene = await prisma.scene.findUnique({
    where: { id },
    select,
  });

  if (!scene) {
    logger.warn('Scene not found', { id });
    throw new AppError('Scene not found', 404);
  }

  const result = await populateSignedUrls(scene, {
    inputField: 'path',
    outputField: 'url',
    maxDepth: 3,
    cacheTTL: 16 * 3600,
  });

  return result;
}

async function getSceneByIds(ids, { minimal = false }) {
  logger.info('Fetching scenes by ids', { ids, minimal });

  const scenes = await prisma.scene.findMany({
    where: { id: { in: ids } },
    include: {
      show: true,
      difficulty: true,
      city: true,
      prefecture: true,
      region: true,
      images: true,
    },
  });

  if (!scenes.length) {
    logger.warn('Scenes not found', { ids });
    throw new AppError('Scenes not found', 404);
  }

  const result = await populateSignedUrls(scenes, {
    inputField: 'path',
    outputField: 'url',
    maxDepth: 3,
    cacheTTL: 16 * 3600,
  });

  return result;
}

async function listScenes(query, options = {}) {
  const {
    page = 1,
    limit = 10,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    showId,
    difficultyId,
    cityId,
    prefectureId,
    regionId,
  } = query;

  const {
    includeShow = true,
    includeDifficulty = true,
    includeCity = true,
    includePrefecture = true,
    includeRegion = true,
    includeImages = true,
  } = options;

  const skip = (page - 1) * limit;

  const where = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      showId ? { showId } : undefined,
      difficultyId ? { difficultyId } : undefined,
      cityId ? { cityId } : undefined,
      prefectureId ? { prefectureId } : undefined,
      regionId ? { regionId } : undefined,
    ].filter(Boolean),
  };

  const allowedSortFields = ['name', 'createdAt', 'updatedAt'];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

  const select = {
    id: true,
    name: true,
    description: true,
    latitude: true,
    longitude: true,
    createdAt: true,
    updatedAt: true,
    ...(includeShow && {
      show: {
        select: { id: true, title: true, alternativeTitle: true },
      },
    }),
    ...(includeDifficulty && {
      difficulty: {
        select: { id: true, name: true, colorCode: true },
      },
    }),
    ...(includeCity && {
      city: {
        select: { id: true, name: true },
      },
    }),
    ...(includePrefecture && {
      prefecture: {
        select: { id: true, name: true },
      },
    }),
    ...(includeRegion && {
      region: {
        select: { id: true, name: true },
      },
    }),
    ...(includeImages && {
      images: {
        select: { id: true, path: true, alt: true },
      },
    }),
  };

  const [scenes, total] = await Promise.all([
    prisma.scene.findMany({
      where,
      select,
      skip,
      take: limit,
      orderBy: { [safeSortBy]: sortOrder },
    }),
    prisma.scene.count({ where }),
  ]);

  logger.info('Scenes fetched successfully', { count: scenes.length, total });

  return {
    data: scenes,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function updateScene(id, data, files = []) {
  logger.info('Updating scene', { id });

  const existingScene = await prisma.scene.findUnique({
    where: { id },
    include: {
      show: true,
      difficulty: true,
      city: true,
      prefecture: true,
      region: true,
      images: true,
    },
  });

  if (!existingScene) {
    logger.warn('Scene not found', { id });
    throw new AppError('Scene not found', 404);
  }

  if (data.name && data.name !== existingScene.name) {
    const duplicate = await prisma.scene.findFirst({
      where: {
        name: data.name,
        showId: data.showId || existingScene.showId,
        id: { not: id },
      },
    });
    if (duplicate) {
      logger.warn('Scene with this name already exists for this show', {
        name: data.name,
      });
      throw new AppError('Scene with this name already exists for this show', 400);
    }
  }

  if (data.cityId || data.prefectureId || data.regionId) {
    const [city, prefecture, region] = await Promise.all([
      data.cityId ? prisma.city.findUnique({ where: { id: data.cityId } }) : null,
      data.prefectureId
        ? prisma.prefecture.findUnique({ where: { id: data.prefectureId } })
        : null,
      data.regionId ? prisma.region.findUnique({ where: { id: data.regionId } }) : null,
    ]);

    if (data.cityId && !city) throw new AppError('City not found', 400);

    if (data.prefectureId && !prefecture) throw new AppError('Prefecture not found', 400);

    if (data.regionId && !region) throw new AppError('Region not found', 400);

    if (city && data.prefectureId && city.prefectureId !== data.prefectureId) {
      throw new AppError('City does not belong to the given prefecture', 400);
    }

    if (prefecture && data.regionId && prefecture.regionId !== data.regionId) {
      throw new AppError('Prefecture does not belong to the given region', 400);
    }
  }

  // Handle new image uploads
  let uploadedPaths = [];
  if (files && files.length > 0) {
    const filesWithSecureNames = req.files.map((file) => {
      const ext = path.extname(file.originalname);
      return {
        ...file,
        originalname: `${uuidv4()}${ext}`,
      };
    });

    uploadedPaths = await uploadFiles(
      filesWithSecureNames,
      `scenes/${data.showId || existingScene.showId}/${existingScene.id}`,
    );
  }

  // Handle image deletions
  let pathsToDelete = [];
  let imageUpdateData;

  const hasNewImages = uploadedPaths.length > 0;
  const hasDeletedImages = data.deletedImageIds && data.deletedImageIds.length > 0;

  if (hasDeletedImages || hasNewImages) {
    imageUpdateData = {};

    // Delete specified images
    if (hasDeletedImages) {
      const imagesToDelete = existingScene.images.filter((img) =>
        data.deletedImageIds.includes(img.id),
      );
      pathsToDelete = imagesToDelete.map((img) => img.path);

      imageUpdateData.deleteMany = {
        id: { in: data.deletedImageIds },
      };
    }

    // Add new images
    if (hasNewImages) {
      imageUpdateData.create = uploadedPaths.map((path, index) => ({
        path,
        alt: data.newImageAlts?.[index] || null,
      }));
    }
  }

  try {
    const updated = await prisma.scene.update({
      where: { id },
      data: {
        name: data.name ?? existingScene.name,
        description: data.description ?? existingScene.description,
        latitude: data.latitude ?? existingScene.latitude,
        longitude: data.longitude ?? existingScene.longitude,
        showId: data.showId ?? existingScene.showId,
        difficultyId: data.difficultyId ?? existingScene.difficultyId,
        cityId: data.cityId !== undefined ? data.cityId : existingScene.cityId,
        prefectureId:
          data.prefectureId !== undefined
            ? data.prefectureId
            : existingScene.prefectureId,
        regionId: data.regionId !== undefined ? data.regionId : existingScene.regionId,
        images: imageUpdateData,
      },
      include: {
        show: true,
        difficulty: true,
        city: true,
        prefecture: true,
        region: true,
        images: true,
      },
    });

    // Clean up deleted files from file service (after successful DB update)
    if (pathsToDelete.length > 0) {
      await deleteFiles(pathsToDelete);
    }

    logger.info('Scene updated successfully', { id });
    return updated;
  } catch (error) {
    // Rollback: delete newly uploaded files if update fails
    if (uploadedPaths.length > 0) {
      logger.warn('Scene update failed, cleaning up uploaded files');
      await deleteFiles(uploadedPaths);
    }
    throw error;
  }
}

async function deleteScene(id) {
  logger.info('Deleting scene', { id });

  const existingScene = await prisma.scene.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!existingScene) {
    logger.warn('Scene not found', { id });
    throw new AppError('Scene not found', 404);
  }

  const imagePaths = existingScene.images.map((img) => img.path);

  await prisma.scene.delete({ where: { id } });
  logger.info('Scene deleted successfully', { id });

  if (imagePaths.length > 0) {
    await deleteFiles(imagePaths);
  }

  return { message: 'Scene deleted successfully' };
}

async function deleteMultipleScenes(ids) {
  logger.info('Deleting multiple scenes', { ids });

  const deleted = await prisma.scene.deleteMany({
    where: { id: { in: ids } },
  });

  if (!deleted.count) {
    logger.warn('No scenes found with provided IDs');
    throw new AppError('No scenes found with provided IDs', 404);
  }

  logger.info('Scenes deleted successfully', { deletedCount: deleted.count });

  return {
    message: `${deleted.count} scene(s) deleted successfully`,
    deletedCount: deleted.count,
  };
}

export async function getRandomScenes(params) {
  const {
    count = 5,
    difficultyWeights = [],
    showId,
    cityId,
    prefectureId,
    regionId,
    excludeSceneIds = [],
  } = params;

  logger.info('Fetching random scenes', { count, params });

  const hasWeights = Array.isArray(difficultyWeights) && difficultyWeights.length > 0;
  const difficultyIds = hasWeights
    ? difficultyWeights.map((dw) => dw.difficultyId)
    : undefined;

  const weightMap = hasWeights
    ? Object.fromEntries(difficultyWeights.map((dw) => [dw.difficultyId, dw.weight]))
    : {};

  const randomCutoff = Math.random();
  const directionUp = Math.random() < 0.5; // 50/50 direction choice
  const overFetchMultiplier = hasWeights ? 2 : 1;

  const whereBase = {
    ...(showId && { showId }),
    ...(cityId && { cityId }),
    ...(prefectureId && { prefectureId }),
    ...(regionId && { regionId }),
    ...(excludeSceneIds.length > 0 && { id: { notIn: excludeSceneIds } }),
    ...(difficultyIds && { difficultyId: { in: difficultyIds } }),
  };

  // First query: directional sample
  let scenes = await prisma.scene.findMany({
    where: {
      ...whereBase,
      randomKey: directionUp ? { gte: randomCutoff } : { lte: randomCutoff },
    },
    include: {
      show: true,
      difficulty: true,
      city: true,
      prefecture: true,
      region: true,
      images: true,
    },
    orderBy: { randomKey: directionUp ? 'asc' : 'desc' },
    take: count * overFetchMultiplier,
  });

  // Wrap-around query if not enough rows
  if (scenes.length < count * overFetchMultiplier) {
    const remaining = count * overFetchMultiplier - scenes.length;
    const wrapScenes = await prisma.scene.findMany({
      where: {
        ...whereBase,
        randomKey: directionUp ? { lte: randomCutoff } : { gte: randomCutoff },
      },
      include: {
        show: true,
        difficulty: true,
        city: true,
        prefecture: true,
        region: true,
        images: true,
      },
      orderBy: { randomKey: directionUp ? 'asc' : 'desc' },
      take: remaining,
    });
    scenes = [...scenes, ...wrapScenes];
  }

  // Weighted sampling (if needed)
  let selected = scenes;
  if (hasWeights) {
    const reservoir = scenes.map((scene) => ({
      scene,
      weight: weightMap[scene.difficultyId] || 0,
    }));

    selected = [];
    for (let i = 0; i < Math.min(count, reservoir.length); i++) {
      const totalRemainingWeight = reservoir
        .slice(i)
        .reduce((sum, item) => sum + item.weight, 0);

      let random = Math.random() * totalRemainingWeight;
      let selectedIndex = i;

      for (let j = i; j < reservoir.length; j++) {
        random -= reservoir[j].weight;
        if (random <= 0) {
          selectedIndex = j;
          break;
        }
      }

      [reservoir[i], reservoir[selectedIndex]] = [reservoir[selectedIndex], reservoir[i]];
      selected.push(reservoir[i].scene);
    }
  } else {
    // If no weights, shuffle once and trim
    selected = shuffleArray(scenes).slice(0, count);
  }

  const result = await populateSignedUrls(selected, {
    inputField: 'path',
    outputField: 'url',
    maxDepth: 3,
    cacheTTL: 16 * 3600,
  });

  logger.info('Random scenes fetched successfully', {
    count: result.length,
    direction: directionUp ? 'asc' : 'desc',
  });

  return result;
}

export default {
  createScene,
  getSceneById,
  getSceneByIds,
  listScenes,
  updateScene,
  deleteScene,
  deleteMultipleScenes,
  getRandomScenes,
};
