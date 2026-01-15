const redis = require('redis');
const logger = require('../utils/logger');

// Create Redis client
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Error handling
client.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

client.on('connect', () => {
  logger.info('Redis connected');
});

client.on('ready', () => {
  logger.info('Redis ready');
});

// Connect to Redis (async)
(async () => {
  try {
    await client.connect();
  } catch (err) {
    logger.error('Failed to connect to Redis:', err);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await client.quit();
    logger.info('Redis connection closed');
  } catch (err) {
    logger.error('Error closing Redis connection:', err);
  }
});

module.exports = client;
