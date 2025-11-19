import express from 'express';
import {
  createPrefecture,
  listPrefectures,
  getPrefectureById,
  getPrefectureByIds,
  updatePrefecture,
  deletePrefecture,
  deleteMultiplePrefectures,
} from '../controllers/prefectureController.js';

const router = express.Router();

router.post('/create', createPrefecture);
router.get('/', listPrefectures);
router.post('/', getPrefectureByIds);
router.get('/id/:id', getPrefectureById);
router.patch('/id/:id', updatePrefecture);
router.delete('/id/:id', deletePrefecture);
router.delete('/', deleteMultiplePrefectures);

export default router;
