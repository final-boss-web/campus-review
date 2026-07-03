import winston from 'winston';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Log format for files (clean text without ANSI color codes)
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level.toUpperCase()}]: ${info.message}`
  )
);

// Format for terminal console output (colorized, filters out high-frequency access logs)
const filterAccessLogs = winston.format((info) => {
  if (info.message && info.message.startsWith('[ACCESS]')) {
    return false; // Suppress from console
  }
  return info;
});

const consoleFormat = winston.format.combine(
  filterAccessLogs(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level}]: ${info.message}`
  )
);

const transports = [
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// Check if running in serverless environments (AWS Lambda, Vercel, etc.) where filesystems are read-only
const isServerless = !!(process.env.VERCEL || process.env.LAMBDA_TASK_ROOT || process.env.AWS_LAMBDA_FUNCTION_NAME);

// Write to files in development environment or when explicitly requested,
// to avoid ENOENT/read-only filesystem errors in serverless/production hosting
const enableFileLogging = 
  (process.env.NODE_ENV === 'development' || process.env.ENABLE_FILE_LOGGING === 'true') &&
  process.env.DISABLE_FILE_LOGGING !== 'true' &&
  !isServerless;

if (enableFileLogging) {
  const logDir = process.env.LOG_DIR || 'logs';
  transports.push(
    new winston.transports.File({
      filename: `${logDir}/error.log`,
      level: 'error',
      format: logFormat,
    }),
    new winston.transports.File({
      filename: `${logDir}/combined.log`,
      format: logFormat,
    }),
    new winston.transports.File({
      filename: `${logDir}/access.log`,
      level: 'info',
      format: logFormat,
    })
  );
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  transports,
});

export default logger;
