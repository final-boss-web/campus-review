import jwt from 'jsonwebtoken';
import { UAParser } from 'ua-parser-js';
import logger from '../config/logger.js';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';

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
    'otp',
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

  // Parse User Agent
  const parser = new UAParser(req.headers['user-agent'] || '');
  const ua = parser.getResult();

  // Decode JWT to identify who is making the request
  let decoded = null;
  let jwtId = null;
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      decoded = jwt.decode(token);
      if (decoded) {
        jwtId = decoded.jti || null;
      }
    }
  } catch (err) {
    // Ignore decoding errors
  }

  // Intercept res.send/res.json to extract response details for precise action mapping
  const originalSend = res.send;
  let responseData = null;

  res.send = function (body) {
    if (body) {
      try {
        if (typeof body === 'string') {
          responseData = JSON.parse(body);
        } else if (typeof body === 'object') {
          responseData = body;
        }
      } catch (err) {
        // Not a JSON response
      }
    }
    return originalSend.apply(this, arguments);
  };

  // Once response completes, calculate duration and log
  res.on('finish', async () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const method = req.method;
    const url = req.originalUrl || req.url;

    // Sanitize and redact body/queries to prevent leaks of passwords/tokens
    const cleanQuery = redactSensitiveData(req.query);
    const cleanBody = redactSensitiveData(req.body);

    const queryStr = JSON.stringify(cleanQuery);
    const bodyStr = JSON.stringify(cleanBody);

    const logMessage = `[ACCESS] ${ip} - "${method} ${url}" ${status} ${duration}ms | Query: ${queryStr} | Body: ${bodyStr}`;
    const path = url.split('?')[0];



    // Suppress winston console logs for high-frequency analytic pings to keep terminal clean
    if (path !== '/api/analytics/log') {
      if (status >= 500) {
        logger.error(logMessage);
      } else if (status >= 400) {
        logger.warn(logMessage);
      } else {
        logger.info(logMessage);
      }
    }

    // Determine Action
    let action = 'API Request';


    // Read action from direct frontend pings, otherwise map API endpoints
    if (path === '/api/analytics/log') {
      action = req.body?.action || 'Page View';
    } else if (path.startsWith('/api/auth/register') && (status === 200 || status === 201)) {
      action = 'Register';
    } else if ((path.startsWith('/api/auth/login') || path.startsWith('/api/auth/google')) && status === 200) {
      action = 'Login';
    } else if (path.startsWith('/api/auth/logout')) {
      action = 'Logout';
    } else if (path.startsWith('/api/auth/forgot-password')) {
      action = 'Password Reset';
    } else if (path.startsWith('/api/auth/reset-password')) {
      action = 'Change Password';
    } else if (path.startsWith('/api/users/profile/') && method === 'GET') {
      action = 'Profile Viewed';
    } else if (path.startsWith('/api/users/bookmark') && method === 'POST') {
      if (responseData?.message?.toLowerCase().includes('added')) {
        action = 'Bookmark Added';
      } else if (responseData?.message?.toLowerCase().includes('removed')) {
        action = 'Bookmark Removed';
      } else {
        action = 'Bookmark';
      }
    } else if (path.startsWith('/api/users/ban') && method === 'PUT') {
      action = 'Admin Action';
    } else if (path.startsWith('/api/reviews') && method === 'POST' && status === 201) {
      action = 'Review Created';
    } else if (path.startsWith('/api/reviews/') && method === 'PUT' && status === 200) {
      action = 'Review Updated';
    } else if (path.startsWith('/api/reviews/') && method === 'DELETE' && status === 200) {
      action = 'Review Deleted';
    } else if (path.endsWith('/like') && method === 'POST' && status === 200) {
      if (responseData?.message?.toLowerCase().includes('unlike')) {
        action = 'Unlike';
      } else {
        action = 'Like';
      }
    } else if (path.endsWith('/flag') && method === 'POST' && status === 200) {
      action = 'Report Review';
    } else if (path.startsWith('/api/comments') && method === 'POST' && status === 201) {
      action = 'Comment Added';
    } else if (path.startsWith('/api/comments/') && method === 'DELETE' && status === 200) {
      action = 'Comment Deleted';
    } else if (path.startsWith('/api/scams') && method === 'POST' && status === 201) {
      action = 'Report Review';
    } else if (path.startsWith('/api/upload')) {
      action = 'Upload';
    } else if (path.startsWith('/api/places') && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
      action = 'Admin Action';
    }

    // Security flags check
    const failedLogin = (path.includes('/login') || path.includes('/google')) && (status === 400 || status === 401 || status === 403);
    const unauthorizedAccess = status === 403;
    const rateLimitTrigger = status === 429;
    const invalidJwt = status === 401 && responseData?.message?.toLowerCase().includes('token');
    const suspiciousActivity = status === 400 && (path.includes('/auth') || path.includes('/admin'));

    // Resolve User details
    let userId = req.user?._id || decoded?.id || null;
    let username = '';
    let fullName = '';
    let email = '';

    if (userId) {
      try {
        const u = req.user || await User.findById(userId).lean();
        if (u) {
          userId = u._id;
          username = u.email; // mapping email as username
          fullName = u.name;
          email = u.email;
        }
      } catch (err) {
        // Ignore DB lookup errors
      }
    }

    // Extract geo metadata from client headers
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

    // Save to Database ActivityLog (asynchronous background task)
    ActivityLog.create({
      user: userId,
      username,
      fullName,
      email,
      action,
      sessionId,
      jwtId,
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
      currentPage: currentPage || path,
      previousPage,
      referrer,
      requestUrl: url,
      apiEndpoint: path,
      httpMethod: method,
      requestBody: cleanBody,
      queryParams: cleanQuery,
      responseStatus: status,
      responseTime: duration,
      security: {
        failedLogin,
        invalidJwt,
        unauthorizedAccess,
        rateLimitTrigger,
        suspiciousActivity,
      },
    }).catch((dbErr) => {
      logger.error(`Database ActivityLog saving error: ${dbErr.message}`);
    });
  });

  next();
};

