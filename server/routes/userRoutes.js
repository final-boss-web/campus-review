import express from 'express';
import {
  getUserProfile,
  toggleBookmark,
  getAllUsers,
  toggleBanUser,
} from '../controllers/userController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile/:id', optionalAuth, getUserProfile);
router.post('/bookmark', protect, toggleBookmark);

// Admin-only endpoints
router.get('/', protect, adminOnly, getAllUsers);
router.put('/ban/:id', protect, adminOnly, toggleBanUser);

export default router;
