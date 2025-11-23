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

import { uploadSceneImages, handleMulterError } from '../middleware/multerMiddleware.js';

const router = express.Router();

router.post('/create', uploadSceneImages, handleMulterError, createScene);
router.get('/', listScenes);
router.post('/', getSceneByIds);
router.get('/id/:id', getSceneById);
router.patch('/id/:id', uploadSceneImages, handleMulterError, updateScene);
router.delete('/id/:id', deleteScene);
router.delete('/', deleteMultipleScenes);

router.post('/random', getRandomScenes);
router.post('/calculate-distance', calculateDistance);

export default router;
