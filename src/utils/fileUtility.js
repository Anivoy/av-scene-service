import axios from 'axios';
import FormData from 'form-data';

import { AppError } from '../utils/errorUtility.js';
import { logger } from '../config/logger.js';
import { serviceConfig } from '../config/env.js';
import { redisClient } from '../config/redis.js';

/**
 * Upload a single file to file service
 * @param {Object} file - Single file object from multer
 * @param {String} destination - Target folder on file server
 * @returns {Promise<String>} Uploaded file path
 */
export async function uploadFile(
  file,
  destination,
  options = { public: false, signed: true },
) {
  if (!file) {
    throw new Error('No file provided.');
  }

  try {
    logger.info('Uploading file to file service', { filename: file.originalname });

    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const response = await axios.post(
      `${serviceConfig.FILE_SERVICE_URL}/api/v1/file/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        params: {
          destination,
          ...options,
        },
      },
    );

    const result = response.data.data;

    logger.info('File uploaded successfully', { path: result.path });

    return result;
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message || error.message || 'Failed to upload file';

    logger.error('Error uploading file', { message, status });
    throw new AppError(message, status);
  }
}

/**
 * Upload files to file service
 * @param {Array} files - Array of file objects from multer
 * @returns {Promise<Array>} Array of uploaded file paths
 */
export async function uploadFiles(
  files,
  destination,
  options = { public: false, signed: true },
) {
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
          ...options,
        },
      },
    );

    const result = response.data.data;

    logger.info('Files uploaded successfully', { count: result?.length || 0 });

    return result;
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
        paths,
      },
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
export async function populateSignedUrls(data, options = {}) {
  const {
    fields,
    inputField = 'path',
    outputField = 'url',
    maxDepth = 10,
    cacheTTL = 3600,
  } = options;

  // Normalize field mappings — always treat as an array
  const fieldMappings = fields?.length
    ? fields.map((f) => ({ input: f.input, output: f.output }))
    : [{ input: inputField, output: outputField }];

  const pathsToFetch = new Set();
  const pathLocations = []; // Array: { obj, fieldMapping, path }

  /**
   * Recursively find matching input fields (multiple)
   */
  function findPaths(obj, currentDepth = 0) {
    if (obj == null || currentDepth > maxDepth) return;

    if (Array.isArray(obj)) {
      obj.forEach((item) => findPaths(item, currentDepth));
      return;
    }

    if (typeof obj === 'object') {
      for (const mapping of fieldMappings) {
        const { input } = mapping;

        if (input in obj && typeof obj[input] === 'string') {
          const path = obj[input];

          if (path) {
            pathsToFetch.add(path);
            pathLocations.push({ obj, fieldMapping: mapping, path });
          }
        }
      }

      if (currentDepth < maxDepth) {
        Object.values(obj).forEach((value) => findPaths(value, currentDepth + 1));
      }
    }
  }

  // Begin scanning
  findPaths(data);

  if (pathsToFetch.size === 0) {
    return data;
  }

  const pathToUrlMap = new Map();
  const uncachedPaths = [];
  const pathsArray = Array.from(pathsToFetch);

  /**
   * Redis batch lookup
   */
  try {
    const pipeline = redisClient.pipeline();

    pathsArray.forEach((path) => {
      pipeline.get(`signed_url:${path}`);
    });

    const results = await pipeline.exec();

    pathsArray.forEach((path, index) => {
      const [error, cachedUrl] = results[index];

      if (error) {
        uncachedPaths.push(path);
      } else if (cachedUrl) {
        pathToUrlMap.set(path, cachedUrl);
      } else {
        uncachedPaths.push(path);
      }
    });
  } catch (error) {
    logger.error('Error checking Redis pipeline:', { error });
    uncachedPaths.push(...pathsArray);
  }

  /**
   * Fetch uncached paths from file service
   */
  if (uncachedPaths.length > 0) {
    try {
      const response = await axios.post(`${serviceConfig.FILE_SERVICE_URL}/api/v1/file`, {
        paths: uncachedPaths,
        signed: true,
        public: false,
      });

      const signedUrls = response?.data?.data || [];

      for (const item of signedUrls) {
        pathToUrlMap.set(item.path, item.url);

        try {
          await redisClient.setex(`signed_url:${item.path}`, cacheTTL, item.url);
        } catch (err) {
          logger.warn('Redis caching error', { path: item.path, err });
        }
      }
    } catch (err) {
      logger.error('Error fetching signed URLs:', err);
      throw new Error('Failed to fetch signed URLs');
    }
  }

  /**
   * Apply mapped URL fields
   */
  for (const { obj, fieldMapping, path } of pathLocations) {
    const signedUrl = pathToUrlMap.get(path);
    if (signedUrl) {
      obj[fieldMapping.output] = signedUrl; // dynamic output field
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
