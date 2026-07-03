import express from 'express';
import {
  getDashboardStats,
  logActivity,
  exportActivityLogs,
  getActivityLogs,
} from '../controllers/analyticsController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, adminOnly, getDashboardStats);
router.post('/log', logActivity);
router.get('/export', protect, adminOnly, exportActivityLogs);
router.get('/logs', protect, adminOnly, getActivityLogs);

export default router;

