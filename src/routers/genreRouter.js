import express from 'express';
import {
  createGenre,
  listGenres,
  getGenreById,
  getGenreByIds,
  updateGenre,
  deleteGenre,
  deleteMultipleGenres,
} from '../controllers/genreController.js';

const router = express.Router();

router.post('/create', createGenre);
router.get('/', listGenres);
router.post('/', getGenreByIds);
router.get('/id/:id', getGenreById);
router.patch('/id/:id', updateGenre);
router.delete('/id/:id', deleteGenre);
router.delete('/', deleteMultipleGenres);

export default router;
