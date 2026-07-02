import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../config/logger.js';

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Also support Bearer token for development or testing versatility
    if (!token && req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    if (user.status === 'banned') {
      // Clear cookie if user is banned
      res.clearCookie('token');
      return res.status(403).json({ message: 'Your account has been banned by the administrator.' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error(`Auth Middleware Error: ${error.message}`);
    return res.status(401).json({ message: 'Session expired or invalid token. Please log in again.' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const user = await User.findById(decoded.id);
      if (user && user.status !== 'banned') {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Silently continue as guest
    next();
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
};
