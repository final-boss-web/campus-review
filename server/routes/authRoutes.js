import express from 'express';
import {
  googleLogin,
  logout,
  getMe,
  register,
  login,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/google', googleLogin);
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);
router.get('/me', optionalAuth, getMe);

export default router;
