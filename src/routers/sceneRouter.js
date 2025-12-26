import express from 'express';
import {
  createScene,
  listScenes,
  getSceneById,
  getSceneByIds,
  updateScene,
  deleteScene,
  deleteMultipleScenes,
} from '../controllers/sceneAdmController.js';
import {
  calculateDistance,
  getRandomScenes,
} from '../controllers/sceneGameController.js';

import { upload, handleMulterError } from '../middleware/multerMiddleware.js';

const router = express.Router();

router.post(
  '/create',
  upload.fields([
    { name: 'snippet', maxCount: 1 },
    { name: 'reference', maxCount: 1 },
  ]),
  handleMulterError,
  createScene,
);
router.get('/', listScenes);
router.post('/', getSceneByIds);
router.get('/id/:id', getSceneById);
router.patch(
  '/id/:id',
  upload.fields([
    { name: 'snippet', maxCount: 1 },
    { name: 'reference', maxCount: 1 },
  ]),
  handleMulterError,
  updateScene,
);
router.delete('/id/:id', deleteScene);
router.delete('/', deleteMultipleScenes);

router.post('/random', getRandomScenes);
router.post('/calculate-distance', calculateDistance);

export default router;
