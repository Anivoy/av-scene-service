import express from 'express';
import {
  createShow,
  listShows,
  getShowById,
  getShowByIds,
  updateShow,
  deleteShow,
  deleteMultipleShows,
} from '../controllers/showController.js';

import { upload, handleMulterError } from '../middleware/multerMiddleware.js';

const router = express.Router();

router.post('/create', upload.single("cover"), handleMulterError, createShow);
router.get('/', listShows);
router.post('/', getShowByIds);
router.get('/id/:id', getShowById);
router.patch('/id/:id', upload.single("cover"), handleMulterError, updateShow);
router.delete('/id/:id', deleteShow);
router.delete('/', deleteMultipleShows);

export default router;
