import logger from '../config/logger.js';
import ActivityLog from '../models/ActivityLog.js';
import { UAParser } from 'ua-parser-js';

const redactSensitiveData = (data) => {
  if (!data) return data;
  if (typeof data !== 'object') return data;
  const redacted = { ...data };
  const sensitiveKeys = ['password', 'token', 'credential', 'client_id', 'clientSecret', 'secret', 'otp'];
  for (const key of Object.keys(redacted)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = redactSensitiveData(redacted[key]);
    }
  }
  return redacted;
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log the full error internally in console/files
  logger.error(`${err.name} - ${err.message} - Path: ${req.originalUrl} - Method: ${req.method} - IP: ${req.ip} \nStack: ${err.stack}`);

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const keyName = Object.keys(err.keyValue)[0];
    const finalStatus = 409;
    logErrorToDatabase(err, req, finalStatus);
    return res.status(409).json({
      message: `A record with this ${keyName} already exists.`,
    });
  }

  // Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    const finalStatus = 400;
    logErrorToDatabase(err, req, finalStatus);
    return res.status(400).json({
      message: `Invalid ID format for ${err.path}.`,
    });
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    const finalStatus = 400;
    logErrorToDatabase(err, req, finalStatus);
    return res.status(400).json({
      message: 'Validation failed',
      errors: messages,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const finalStatus = 401;
    logErrorToDatabase(err, req, finalStatus);
    return res.status(401).json({
      message: 'Invalid authorization token.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    const finalStatus = 401;
    logErrorToDatabase(err, req, finalStatus);
    return res.status(401).json({
      message: 'Authorization token has expired. Please log in again.',
    });
  }

  // Default server error
  logErrorToDatabase(err, req, statusCode);

  res.status(statusCode).json({
    message,
    // Hide details in production
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Helper function to log error events asynchronously to MongoDB
const logErrorToDatabase = (err, req, status) => {
  try {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      req.ip ||
      'Unknown IP';

    const parser = new UAParser(req.headers['user-agent'] || '');
    const ua = parser.getResult();

    const path = req.originalUrl || req.url;
    const cleanPath = path.split('?')[0];

    // Identify if this is a security failure
    const isJwtError = err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError';
    const failedLogin = (cleanPath.includes('/login') || cleanPath.includes('/google')) && (status === 400 || status === 401 || status === 403);
    const unauthorizedAccess = status === 403 || status === 401;

    let action = 'API Error';
    if (status === 404) action = '404 Error';
    else if (isJwtError || unauthorizedAccess) action = 'Authentication Error';

    const sessionId = req.headers['x-client-session-id'] || req.body?.sessionId || null;
    const screenResolution = req.headers['x-client-screen-resolution'] || req.body?.screenResolution || null;
    const timezone = req.headers['x-client-timezone'] || req.body?.timezone || null;
    const currentPage = req.headers['x-client-current-page'] || req.body?.currentPage || null;
    const previousPage = req.headers['x-client-previous-page'] || req.body?.previousPage || null;
    const referrer = req.headers['x-client-referrer'] || req.body?.referrer || null;
    const country = req.headers['x-client-country'] || req.body?.country || null;
    const state = req.headers['x-client-state'] || req.body?.state || null;
    const city = req.headers['x-client-city'] || req.body?.city || null;
    const latitude = req.headers['x-client-latitude'] ? parseFloat(req.headers['x-client-latitude']) : (req.body?.latitude || null);
    const longitude = req.headers['x-client-longitude'] ? parseFloat(req.headers['x-client-longitude']) : (req.body?.longitude || null);

    // Save error info inside the log body
    const bodyPayload = {
      errorMessage: err.message,
      errorName: err.name,
      requestBody: redactSensitiveData(req.body),
    };

    ActivityLog.create({
      user: req.user?._id || null,
      username: req.user?.email || '',
      fullName: req.user?.name || '',
      email: req.user?.email || '',
      action,
      sessionId,
      ip,
      country,
      state,
      city,
      timezone,
      latitude,
      longitude,
      browser: ua.browser.name || 'Unknown Browser',
      browserVersion: ua.browser.version || 'Unknown',
      os: ua.os.name || 'Unknown OS',
      deviceType: ua.device.type || 'desktop',
      platform: ua.os.name || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown User-Agent',
      screenResolution,
      currentPage: currentPage || cleanPath,
      previousPage,
      referrer,
      requestUrl: path,
      apiEndpoint: cleanPath,
      httpMethod: req.method,
      requestBody: bodyPayload,
      queryParams: redactSensitiveData(req.query),
      responseStatus: status,
      responseTime: 0,
      security: {
        failedLogin,
        invalidJwt: isJwtError,
        unauthorizedAccess,
        rateLimitTrigger: status === 429,
        suspiciousActivity: status === 400 && cleanPath.includes('/auth'),
      },
    }).catch((dbErr) => {
      logger.error(`Database ActivityLog error logging failed: ${dbErr.message}`);
    });
  } catch (dbErr) {
    logger.error(`Database ActivityLog error logging failed: ${dbErr.message}`);
  }
};

