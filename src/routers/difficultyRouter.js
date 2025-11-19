import express from 'express';
import {
  createDifficulty,
  listDifficulties,
  getDifficultyById,
  getDifficultyByIds,
  updateDifficulty,
  deleteDifficulty,
  deleteMultipleDifficulties,
} from '../controllers/difficultyController.js';

const router = express.Router();

router.post('/create', createDifficulty);
router.get('/', listDifficulties);
router.post('/', getDifficultyByIds);
router.get('/id/:id', getDifficultyById);
router.patch('/id/:id', updateDifficulty);
router.delete('/id/:id', deleteDifficulty);
router.delete('/', deleteMultipleDifficulties);

export default router;
