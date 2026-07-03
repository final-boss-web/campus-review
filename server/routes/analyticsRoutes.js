import express from 'express';
import { getDashboardStats, logActivity, exportActivityLogs } from '../controllers/analyticsController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, adminOnly, getDashboardStats);
router.post('/log', logActivity);
router.get('/export', protect, adminOnly, exportActivityLogs);

export default router;

