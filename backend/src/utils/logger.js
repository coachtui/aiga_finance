const winston = require('winston');
const path = require('path');

// Sanitize sensitive data from logs
function sanitizeLogData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized = JSON.parse(JSON.stringify(data)); // Deep clone

  const sensitiveKeys = [
    'password', 'token', 'secret', 'authorization',
    'jwt', 'apikey', 'api_key', 'credit_card', 'creditcard',
    'ssn', 'social_security', 'access_key', 'secret_key',
    'private_key', 'aws_secret', 'sendgrid_key', 'plaid_secret',
    'refresh_token', 'bearer',
  ];

  function redact(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }

    for (const key in obj) {
      const lowerKey = key.toLowerCase();

      // Redact sensitive keys
      if (sensitiveKeys.some((sk) => lowerKey.includes(sk))) {
        obj[key] = '[REDACTED]';
      }
      // Redact SQL query parameters (keep query structure, remove values)
      else if (key === 'text' && typeof obj[key] === 'string' && obj[key].includes('$')) {
        obj[key] = obj[key].replace(/\$\d+/g, '$?');
      }
      // Redact Authorization headers
      else if (lowerKey === 'authorization' && typeof obj[key] === 'string') {
        obj[key] = 'Bearer [REDACTED]';
      }
      // Redact email addresses in error messages (optional, more aggressive)
      else if (typeof obj[key] === 'string' && obj[key].match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) {
        // Only redact if it's in a sensitive context
        if (lowerKey.includes('email') || lowerKey.includes('user') || lowerKey.includes('account')) {
          obj[key] = obj[key].replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
        }
      }
      // Recursively sanitize nested objects and arrays
      else if (typeof obj[key] === 'object') {
        redact(obj[key]);
      }
    }
  }

  redact(sanitized);
  return sanitized;
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Define log format with sanitization
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  // Apply sanitization to all log entries
  winston.format((info) => {
    // Sanitize the entire log object
    const sanitized = sanitizeLogData(info);
    return sanitized;
  })(),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.printf((info) => {
        const { timestamp, level, message, ...meta } = info;
        // Sanitize metadata before displaying
        const sanitizedMeta = sanitizeLogData(meta);
        const metaString = Object.keys(sanitizedMeta).length ? JSON.stringify(sanitizedMeta, null, 2) : '';
        return `${timestamp} [${level}]: ${message} ${metaString}`;
      })
    ),
  }),
];

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info'),
  levels,
  format,
  transports,
  exitOnError: false,
});

module.exports = logger;
