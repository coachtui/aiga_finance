const { Pool } = require('pg');
const logger = require('../utils/logger');

// Database connection pool configuration with SSL/TLS support
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  min: parseInt(process.env.DATABASE_POOL_MIN, 10) || 2,
  max: parseInt(process.env.DATABASE_POOL_MAX, 10) || 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased from 2s to 10s for Railway cold starts
};

// SECURITY: Enable SSL/TLS in production environments
if (process.env.NODE_ENV === 'production') {
  poolConfig.ssl = {
    rejectUnauthorized: false,
    // Railway automatically handles SSL - just need to enable it
  };
  logger.info('Database SSL/TLS enabled for production');
} else if (process.env.DATABASE_REQUIRE_SSL === 'true') {
  // Allow SSL requirement in non-production if explicitly enabled
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
  logger.info('Database SSL/TLS enabled');
}

const pool = new Pool(poolConfig);

// Event listeners for pool
pool.on('connect', () => {
  logger.info('New database connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected database error:', err);
  process.exit(-1);
});

// Test database connection
async function testConnection() {
  try {
    // Add a timeout for the connection test
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database connection test timeout after 15s')), 15000)
    );

    const connectPromise = (async () => {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      logger.info('Database connection successful:', result.rows[0].now);
      client.release();
      return true;
    })();

    return await Promise.race([connectPromise, timeoutPromise]);
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
}

// Query helper with error handling
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Query executed', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Query error:', { text, error: error.message });
    throw error;
  }
}

// Transaction helper
async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Graceful shutdown
async function closePool() {
  try {
    await pool.end();
    logger.info('Database pool closed');
  } catch (error) {
    logger.error('Error closing database pool:', error);
  }
}

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  closePool,
};
