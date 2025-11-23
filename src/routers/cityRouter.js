import express from 'express';
import {
  createCity,
  listCities,
  getCityById,
  getCityByIds,
  updateCity,
  deleteCity,
  deleteMultipleCities,
} from '../controllers/cityController.js';

const router = express.Router();

router.post('/create', createCity);
router.get('/', listCities);
router.post('/', getCityByIds);
router.get('/id/:id', getCityById);
router.patch('/id/:id', updateCity);
router.delete('/id/:id', deleteCity);
router.delete('/', deleteMultipleCities);

export default router;
