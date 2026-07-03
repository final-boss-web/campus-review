import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';
import ActivityLog from '../models/ActivityLog.js';

const redactSensitiveData = (data) => {
  if (!data) return data;
  if (typeof data !== 'object') return data;

  const redacted = { ...data };
  const sensitiveKeys = [
    'password',
    'token',
    'credential',
    'client_id',
    'clientSecret',
    'secret',
    'accessToken',
    'refreshToken',
  ];

  for (const key of Object.keys(redacted)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = redactSensitiveData(redacted[key]);
    }
  }

  return redacted;
};

export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Extract client IP address
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    req.ip ||
    'Unknown IP';

  // Decode JWT to identify who is making the request without database overhead
  let userInfo = 'Guest';
  let decoded = null;
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      decoded = jwt.decode(token);
      if (decoded && decoded.id) {
        userInfo = `User[${decoded.id}](${decoded.role || 'user'})`;
      }
    }
  } catch (err) {
    // Ignore token decode errors for guest requests
  }

  // Once response completes, calculate duration and log
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const method = req.method;
    const url = req.originalUrl || req.url;

    // Sanitize and redact body/queries to prevent leaks of passwords/tokens
    const queryStr = JSON.stringify(redactSensitiveData(req.query));
    const bodyStr = JSON.stringify(redactSensitiveData(req.body));

    const logMessage = `[ACCESS] ${ip} - ${userInfo} - "${method} ${url}" ${status} ${duration}ms | Query: ${queryStr} | Body: ${bodyStr}`;

    if (status >= 500) {
      logger.error(logMessage);
    } else if (status >= 400) {
      logger.warn(logMessage);
    } else {
      logger.info(logMessage);
    }

    // Save to Database ActivityLog (asynchronous background task)
    ActivityLog.create({
      user: decoded?.id || null,
      action: `${method} ${url}`,
      path: url,
      ip,
      userAgent: req.headers['user-agent'] || 'Unknown User-Agent',
    }).catch((dbErr) => {
      logger.error(`Database ActivityLog saving error: ${dbErr.message}`);
    });
  });

  next();
};
