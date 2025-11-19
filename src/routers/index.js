import express from 'express';

import cityRoutes from './cityRouter.js';
import difficultyRoutes from './difficultyRouter.js';
import genreRoutes from './genreRouter.js';
import prefectureRoutes from './prefectureRouter.js';
import regionRoutes from './regionRouter.js';
import sceneRoutes from './sceneRouter.js';
import serverUtilityRoutes from './serverUtility.js';
import seasonRoutes from './seasonRouter.js';
import showRoutes from './showRouter.js';

const router = express.Router();

router.use('/city', cityRoutes);
router.use('/difficulty', difficultyRoutes);
router.use('/genre', genreRoutes);
router.use('/prefecture', prefectureRoutes);
router.use('/region', regionRoutes);
router.use('/utility', serverUtilityRoutes);
router.use('/season', seasonRoutes);
router.use('/scene', sceneRoutes);
router.use('/show', showRoutes);

export default router;
