const { client: redisClient } = require('../config/redis');
const logger = require('./logger');

// In-memory fallback store
const memoryStore = new Map();

// Check if Redis is available
let isRedisAvailable = false;

async function checkRedisConnection() {
  try {
    if (redisClientClient) {
      await redisClientClient.ping();
      isRedisAvailable = true;
      logger.info('Session store using Redis');
      return true;
    }
  } catch (error) {
    isRedisAvailable = false;
  }

  if (!isRedisAvailable && !redisClient) {
    logger.info('Session store using in-memory storage (Redis not configured)');
  }
  return false;
}

// Initialize on module load
checkRedisConnection();

/**
 * Store data in session with expiry
 * @param {string} key - Session key
 * @param {any} value - Data to store (will be JSON stringified)
 * @param {number} expirySeconds - Expiry time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<boolean>} Success status
 */
async function set(key, value, expirySeconds = 3600) {
  try {
    const serialized = JSON.stringify(value);

    if (isRedisAvailable && redisClient) {
      await redisClient.setex(key, expirySeconds, serialized);
      logger.debug(`Session data stored in Redis: ${key}`);
      return true;
    } else {
      // In-memory fallback
      const expiry = Date.now() + (expirySeconds * 1000);
      memoryStore.set(key, { data: serialized, expiry });
      logger.debug(`Session data stored in memory: ${key}`);
      return true;
    }
  } catch (error) {
    logger.error('Error storing session data', { key, error: error.message });
    return false;
  }
}

/**
 * Retrieve data from session
 * @param {string} key - Session key
 * @returns {Promise<any|null>} Stored data or null if not found/expired
 */
async function get(key) {
  try {
    if (isRedisAvailable && redisClient) {
      const data = await redisClient.get(key);
      if (data) {
        logger.debug(`Session data retrieved from Redis: ${key}`);
        return JSON.parse(data);
      }
      return null;
    } else {
      // In-memory fallback
      const entry = memoryStore.get(key);
      if (!entry) {
        return null;
      }

      // Check expiry
      if (entry.expiry < Date.now()) {
        memoryStore.delete(key);
        logger.debug(`Session expired and removed: ${key}`);
        return null;
      }

      logger.debug(`Session data retrieved from memory: ${key}`);
      return JSON.parse(entry.data);
    }
  } catch (error) {
    logger.error('Error retrieving session data', { key, error: error.message });
    return null;
  }
}

/**
 * Delete session data
 * @param {string} key - Session key
 * @returns {Promise<boolean>} Success status
 */
async function deleteKey(key) {
  try {
    if (isRedisAvailable && redisClient) {
      await redisClient.del(key);
      logger.debug(`Session data deleted from Redis: ${key}`);
      return true;
    } else {
      memoryStore.delete(key);
      logger.debug(`Session data deleted from memory: ${key}`);
      return true;
    }
  } catch (error) {
    logger.error('Error deleting session data', { key, error: error.message });
    return false;
  }
}

/**
 * Check if key exists
 * @param {string} key - Session key
 * @returns {Promise<boolean>} True if key exists and not expired
 */
async function exists(key) {
  try {
    if (isRedisAvailable && redisClient) {
      const result = await redisClient.exists(key);
      return result === 1;
    } else {
      const entry = memoryStore.get(key);
      if (!entry) {
        return false;
      }
      // Check expiry
      if (entry.expiry < Date.now()) {
        memoryStore.delete(key);
        return false;
      }
      return true;
    }
  } catch (error) {
    logger.error('Error checking session existence', { key, error: error.message });
    return false;
  }
}

/**
 * Clean up expired in-memory sessions (only needed for memory store)
 */
function cleanupExpiredSessions() {
  if (!isRedisAvailable) {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of memoryStore.entries()) {
      if (entry.expiry < now) {
        memoryStore.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} expired in-memory sessions`);
    }
  }
}

// Run cleanup every 5 minutes for in-memory store
setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

module.exports = {
  set,
  get,
  delete: deleteKey,
  exists,
  checkRedisConnection
};
