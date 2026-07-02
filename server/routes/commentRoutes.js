import express from 'express';
import { body } from 'express-validator';
import {
  getCommentsByReview,
  createComment,
  deleteComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

const commentValidationRules = [
  body('reviewId').notEmpty().withMessage('Review ID is required'),
  body('contentText').notEmpty().withMessage('Comment text is required').trim(),
];

router.get('/review/:reviewId', getCommentsByReview);
router.post('/', protect, commentValidationRules, validateRequest, createComment);
router.delete('/:id', protect, deleteComment);

export default router;
