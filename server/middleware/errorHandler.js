import logger from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  // Log the full error internally
  logger.error(`${err.name} - ${err.message} - Path: ${req.originalUrl} - Method: ${req.method} - IP: ${req.ip} \nStack: ${err.stack}`);

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const keyName = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      message: `A record with this ${keyName} already exists.`,
    });
  }

  // Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: `Invalid ID format for ${err.path}.`,
    });
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      message: 'Validation failed',
      errors: messages,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid authorization token.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Authorization token has expired. Please log in again.',
    });
  }

  // Default server error status code 500
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    message,
    // Hide details in production
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
