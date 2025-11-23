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

const router = express.Router();

router.post('/create', createShow);
router.get('/', listShows);
router.post('/', getShowByIds);
router.get('/id/:id', getShowById);
router.patch('/id/:id', updateShow);
router.delete('/id/:id', deleteShow);
router.delete('/', deleteMultipleShows);

export default router;
