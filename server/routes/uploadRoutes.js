import express from 'express';
import { getImageKitAuthParams } from '../config/imagekit.js';
import { protect } from '../middleware/auth.js';
import logger from '../config/logger.js';

const router = express.Router();

router.get('/imagekit-auth', protect, (req, res) => {
  try {
    const authParams = getImageKitAuthParams();
    res.status(200).json(authParams);
  } catch (error) {
    logger.error(`ImageKit Auth Endpoint Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to generate upload signature.' });
  }
});

export default router;
