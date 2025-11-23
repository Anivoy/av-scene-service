import express from 'express';
import {
  createRegion,
  listRegions,
  getRegionById,
  getRegionByIds,
  updateRegion,
  deleteRegion,
  deleteMultipleRegions,
} from '../controllers/regionController.js';

const router = express.Router();

router.post('/create', createRegion);
router.get('/', listRegions);
router.post('/', getRegionByIds);
router.get('/id/:id', getRegionById);
router.patch('/id/:id', updateRegion);
router.delete('/id/:id', deleteRegion);
router.delete('/', deleteMultipleRegions);

export default router;
