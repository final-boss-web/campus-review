import express from 'express';
import { body } from 'express-validator';
import {
  createReview,
  updateReview,
  deleteReview,
  toggleLikeReview,
  flagReview,
  getFlaggedReviews,
} from '../controllers/reviewController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

const reviewValidationRules = [
  body('placeId').notEmpty().withMessage('Place ID is required'),
  body('placeType').isIn(['Hostel', 'Mess', 'Shop']).withMessage('Invalid place type'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('reviewText').notEmpty().withMessage('Review content is required').trim(),
];

router.get('/flagged', protect, adminOnly, getFlaggedReviews);
router.post('/', protect, reviewValidationRules, validateRequest, createReview);
router.put('/:id', protect, reviewValidationRules, validateRequest, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/like', protect, toggleLikeReview);
router.post('/:id/flag', protect, flagReview);

export default router;
