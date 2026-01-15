const redis = require('redis');

// Create Redis client
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      const delay = Math.min(retries * 50, 500);
      return delay;
    },
  },
});

let isConnected = false;

// Error handling
client.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

client.on('connect', () => {
  console.log('Redis connected');
});

client.on('ready', () => {
  console.log('Redis ready');
  isConnected = true;
});

client.on('end', () => {
  console.log('Redis connection closed');
  isConnected = false;
});

// Connect to Redis (async) - but don't exit if it fails
async function connectRedis() {
  try {
    await client.connect();
    isConnected = true;
  } catch (err) {
    console.error('Failed to connect to Redis:', err.message);
    console.warn('Redis is unavailable - app will continue but token blacklist will not work');
    // Don't exit - app can still run without Redis
  }
}

// Initialize connection
connectRedis();

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
