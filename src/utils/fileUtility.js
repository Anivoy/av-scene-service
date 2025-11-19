import axios from 'axios';
import FormData from 'form-data';

import { AppError } from '../utils/errorUtility.js';
import { logger } from '../config/logger.js';
import { serviceConfig } from '../config/env.js';
import { redisClient } from '../config/redis.js';

/**
 * Upload files to file service
 * @param {Array} files - Array of file objects from multer
 * @returns {Promise<Array>} Array of uploaded file paths
 */
export async function uploadFiles(files, destination) {
  if (!files || files.length === 0) {
    return [];
  }

  try {
    logger.info('Uploading files to file service', { count: files.length });

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    });

    const response = await axios.post(
      `${serviceConfig.FILE_SERVICE_URL}/api/v1/file/uploads`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        params: {
          destination,
          public: false,
          signed: true,
        },
      },
    );

    const result = response.data;
    const paths = result.data.map((file) => file.path);

    logger.info('Files uploaded successfully', { paths });

    return paths;
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message || error.message || 'Failed to upload files';

    logger.error('Error uploading files', { message, status });
    throw new AppError(message, status);
  }
}

/**
 * Delete files from file service
 * @param {Array<string>} paths - Array of file paths to delete
 * @returns {Promise<void>}
 */
export async function deleteFiles(paths) {
  if (!paths || paths.length === 0) {
    return;
  }

  try {
    logger.info('Deleting files from file service', { paths });

    await axios.delete(`${serviceConfig.FILE_SERVICE_URL}/api/v1/file`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        paths
      }
    });

    logger.info('Files deleted successfully', { paths });
  } catch (error) {
    logger.warn('Error deleting files (non-critical)', {
      error: error.message,
      paths,
    });
  }
}

/**
 * Populates objects with signed URLs by converting file paths to signed URLs
 * Uses Redis caching to minimize requests to the file service
 * 
 * @param {*} data - The data to populate (object or array)
 * @param {Object} options - Configuration options
 * @param {string} [options.inputField='path'] - The field name containing the file path
 * @param {string} [options.outputField='url'] - The field name to store the signed URL
 * @param {number} [options.maxDepth=10] - Maximum depth for nested search (0 = no deep search)
 * @param {number} [options.cacheTTL=3600] - Cache TTL in seconds (default 1 hour)
 * @returns {Promise<*>} The data with signed URLs populated
 */
export async function populateSignedUrls(data, options) {
  const {
    inputField = 'path',
    outputField = 'url',
    maxDepth = 10,
    cacheTTL = 3600,
  } = options;

  const pathsToFetch = new Set();
  const pathLocations = [];

  /**
   * Recursively search for path fields in the object
   */
  function findPaths(obj, currentDepth = 0) {
    if (obj == null || currentDepth > maxDepth) {
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach((item) => findPaths(item, currentDepth));
      return;
    }

    if (typeof obj === 'object') {
      if (inputField in obj && typeof obj[inputField] === 'string') {
        const path = obj[inputField];
        if (path) {
          pathsToFetch.add(path);
          pathLocations.push({ obj, path });
        }
      }

      if (currentDepth < maxDepth) {
        Object.values(obj).forEach((value) => {
          findPaths(value, currentDepth + 1);
        });
      }
    }
  }

  findPaths(data);

  if (pathsToFetch.size === 0) {
    return data;
  }

  const pathToUrlMap = new Map();

  const uncachedPaths = [];
  const pathsArray = Array.from(pathsToFetch);
  
  try {
    const pipeline = redisClient.pipeline();
    
    pathsArray.forEach(path => {
      pipeline.get(`signed_url:${path}`);
    });
    
    const results = await pipeline.exec();
    
    pathsArray.forEach((path, index) => {
      const [error, cachedUrl] = results[index];
      
      if (error) {
        logger.error(`Error checking cache for path ${path}:`, { error });
        uncachedPaths.push(path);
      } else if (cachedUrl) {
        pathToUrlMap.set(path, cachedUrl);
      } else {
        uncachedPaths.push(path);
      }
    });
  } catch (error) {
    logger.error('Error checking cache with pipeline:', { error });
    uncachedPaths.push(...pathsArray);
  }

  if (uncachedPaths.length > 0) {
    try {
      const response = await axios.post(
        `${serviceConfig.FILE_SERVICE_URL}/api/v1/file`,
        { 
          paths: uncachedPaths,
          signed: true,
          public: false
        }
      );

      const signedUrls = response?.data?.data;

      for (const item of signedUrls) {
        const { path, url } = item;
        pathToUrlMap.set(path, url);

        try {
          await redisClient.setex(`signed_url:${path}`, cacheTTL, url);
        } catch (error) {
          console.error(`Error caching signed URL for path ${path}:`, error);
        }
      }
    } catch (error) {
      console.error('Error fetching signed URLs from file service:', error);
      throw new Error('Failed to fetch signed URLs');
    }
  }

  for (const { obj, path } of pathLocations) {
    const signedUrl = pathToUrlMap.get(path);
    if (signedUrl) {
      obj[outputField] = signedUrl;
    }
  }

  return data;
}

/**
 * Clear cached signed URLs by path or pattern
 * 
 * @param {string|string[]} paths - Single path, array of paths, or pattern (e.g., 'folder/*')
 */
export async function clearSignedUrlCache(paths) {
  const pathArray = Array.isArray(paths) ? paths : [paths];
  
  for (const path of pathArray) {
    try {
      if (path.includes('*')) {
        const keys = await redisClient.keys(`signed_url:${path}`);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      } else {
        await redisClient.del(`signed_url:${path}`);
      }
    } catch (error) {
      console.error(`Error clearing cache for path ${path}:`, error);
    }
  }
}