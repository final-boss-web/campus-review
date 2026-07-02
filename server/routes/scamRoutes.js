import express from 'express';
import { body } from 'express-validator';
import {
  getScams,
  getScamDetail,
  createScamReport,
  verifyScamReport,
  deleteScamReport,
} from '../controllers/scamController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

const scamValidationRules = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('category').isIn([
    'Fake Hostel',
    'Fraud Owner',
    'Deposit Scam',
    'Overcharging',
    'Bad Food',
    'Hidden Charges',
    'Fake Promises',
  ]).withMessage('Invalid scam category'),
  body('description').notEmpty().withMessage('Description is required').trim(),
];

router.get('/', getScams);
router.get('/:id', getScamDetail);
router.post('/', protect, scamValidationRules, validateRequest, createScamReport);
router.put('/:id/verify', protect, adminOnly, verifyScamReport);
router.delete('/:id', protect, adminOnly, deleteScamReport);

export default router;
