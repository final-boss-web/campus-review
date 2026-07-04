import express from 'express';
import { getImageKitAuthParams } from '../config/imagekit.js';
import { getCloudinaryAuthParams } from '../config/cloudinary.js';
import { protect } from '../middleware/auth.js';
import logger from '../config/logger.js';

const router = express.Router();

router.get('/auth', protect, (req, res) => {
  try {
    const role = req.user?.role || 'student';
    if (role === 'admin') {
      const authParams = getImageKitAuthParams();
      res.status(200).json({
        provider: 'imagekit',
        ...authParams,
      });
    } else {
      const authParams = getCloudinaryAuthParams();
      res.status(200).json({
        provider: 'cloudinary',
        ...authParams,
      });
    }
  } catch (error) {
    logger.error(`Upload Auth Endpoint Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to generate upload credentials.' });
  }
});

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
