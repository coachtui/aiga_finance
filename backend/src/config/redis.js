const redis = require('redis');
const logger = require('../utils/logger');

let client = null;
let isConnected = false;

// Only create Redis client if explicitly enabled via environment variable
const redisEnabled = process.env.REDIS_ENABLED === 'true' && process.env.REDIS_URL;

if (redisEnabled) {
  // Create Redis client
  client = redis.createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          logger.warn('Redis reconnection failed after 3 attempts, using in-memory fallback');
          return false; // Stop reconnecting
        }
        const delay = Math.min(retries * 50, 500);
        return delay;
      },
    },
  });

  // Error handling - only log once
  let errorLogged = false;
  client.on('error', (err) => {
    if (!errorLogged) {
      logger.warn('Redis connection error, falling back to in-memory storage:', err.message);
      errorLogged = true;
    }
  });

  client.on('connect', () => {
    logger.info('Redis connected');
  });

  client.on('ready', () => {
    logger.info('Redis ready');
    isConnected = true;
  });

  client.on('end', () => {
    logger.info('Redis connection closed');
    isConnected = false;
  });

  // Connect to Redis (async) - but don't exit if it fails
  async function connectRedis() {
    try {
      await client.connect();
      isConnected = true;
    } catch (err) {
      logger.warn('Redis unavailable - using in-memory session storage');
      client = null; // Set to null so sessionStore uses fallback
    }
  }

  // Initialize connection
  connectRedis();
} else {
  logger.info('Redis disabled - using in-memory session storage for development');
}

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    if (isConnected) {
      await client.quit();
      console.log('Redis connection closed');
    }
  } catch (err) {
    console.error('Error closing Redis connection:', err.message);
  }
});

module.exports = { client, isConnected: () => isConnected };
