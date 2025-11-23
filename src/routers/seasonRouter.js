import express from 'express';
import {
  createSeason,
  listSeasons,
  getSeasonById,
  getSeasonByIds,
  updateSeason,
  deleteSeason,
  deleteMultipleSeasons,
} from '../controllers/seasonController.js';

const router = express.Router();

router.post('/create', createSeason);
router.get('/', listSeasons);
router.post('/', getSeasonByIds);
router.get('/id/:id', getSeasonById);
router.patch('/id/:id', updateSeason);
router.delete('/id/:id', deleteSeason);
router.delete('/', deleteMultipleSeasons);

export default router;
