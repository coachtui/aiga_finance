require('dotenv').config();

const fs = require('fs').promises;
const path = require('path');
const app = require('./src/app');
const { query, testConnection, closePool } = require('./src/config/database');
const logger = require('./src/utils/logger');
const { initializeScheduler } = require('./src/cron/scheduler');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Auto-run migrations on startup
async function runMigrations() {
  try {
    logger.info('Checking for pending database migrations...');

    // Create migrations table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `);
    logger.info('Migrations table ready');

    // Get list of executed migrations
    const result = await query('SELECT name FROM migrations ORDER BY id');
    const executedMigrations = result.rows.map((row) => row.name);
    logger.info(`Found ${executedMigrations.length} executed migrations`);

    // Get all migration files
    const migrationsDir = path.join(__dirname, 'src', 'migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter((file) => file.endsWith('.sql'))
      .sort();

    logger.info(`Found ${migrationFiles.length} migration files`);

    // Run pending migrations
    let executedCount = 0;
    for (const file of migrationFiles) {
      if (!executedMigrations.includes(file)) {
        const filePath = path.join(migrationsDir, file);
        const sql = await fs.readFile(filePath, 'utf8');

        // Run migration in a transaction
        const client = await require('./src/config/database').pool.connect();
        try {
          await client.query('BEGIN');
          await client.query(sql);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          logger.info(`Migration ${file} executed successfully`);
          executedCount++;
        } catch (error) {
          await client.query('ROLLBACK');
          logger.error(`Migration ${file} failed:`, error);
          throw error;
        } finally {
          client.release();
        }
      }
    }

    if (executedCount === 0) {
      logger.info('No pending migrations');
    } else {
      logger.info(`Successfully executed ${executedCount} migrations`);
    }
  } catch (error) {
    logger.error('Migration check failed:', error);
    throw error;
  }
}

// Test database connection before starting server
async function startServer() {
  try {
    logger.info('Starting server...');

    // Test database connection
    logger.info('Testing database connection...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }
    logger.info('Database connection test passed');

    // Run migrations
    await runMigrations();

    // Start server
    const server = app.listen(PORT, HOST, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on ${HOST}:${PORT}`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
      logger.info(`API base URL: http://localhost:${PORT}/${process.env.API_VERSION || 'v1'}`);

      // Initialize scheduled tasks (cron jobs)
      try {
        initializeScheduler();
      } catch (error) {
        logger.error('Failed to initialize scheduler:', error);
        // Don't exit - scheduler is optional, app can still run
      }
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        // Close database pool
        await closePool();

        logger.info('Graceful shutdown complete');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer().catch((error) => {
  logger.error('Fatal error in startServer:', error);
  process.exit(1);
});
