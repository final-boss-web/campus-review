import express from 'express';
import { body } from 'express-validator';
import {
  getPlaces,
  getPlaceDetail,
  createPlace,
  updatePlace,
  deletePlace,
  approvePlace,
  addPlaceImages,
} from '../controllers/placeController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

const placeValidationRules = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('type').isIn(['Hostel', 'Mess', 'Shop']).withMessage('Invalid place type'),
  body('address').notEmpty().withMessage('Address is required').trim(),
  body('phone').notEmpty().withMessage('Phone is required').trim(),
];

router.get('/', getPlaces);
router.get('/:type/:id', getPlaceDetail);

router.post('/', protect, placeValidationRules, validateRequest, createPlace);
router.put('/:type/:id', protect, adminOnly, updatePlace);
router.post('/:type/:id/images', protect, addPlaceImages);
router.delete('/:type/:id', protect, adminOnly, deletePlace);
router.put('/:type/:id/approve', protect, adminOnly, approvePlace);

export default router;
