require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { pool, query } = require('../config/database');
const logger = require('../utils/logger');

// Create migrations table if it doesn't exist
async function createMigrationsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT NOW()
    );
  `;
  await query(createTableQuery);
  logger.info('Migrations table ready');
}

// Get list of executed migrations
async function getExecutedMigrations() {
  const result = await query('SELECT name FROM migrations ORDER BY id');
  return result.rows.map((row) => row.name);
}

// Run a single migration
async function runMigration(filename, sql) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Execute migration SQL
    await client.query(sql);

    // Record migration
    await client.query('INSERT INTO migrations (name) VALUES ($1)', [filename]);

    await client.query('COMMIT');
    logger.info(`Migration ${filename} executed successfully`);
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error(`Migration ${filename} failed:`, error);
    throw error;
  } finally {
    client.release();
  }
}

// Main migration function
async function migrate() {
  try {
    await createMigrationsTable();

    const executedMigrations = await getExecutedMigrations();
    logger.info(`Found ${executedMigrations.length} executed migrations`);

    // Get all migration files
    const migrationsDir = __dirname;
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
        await runMigration(file, sql);
        executedCount++;
      }
    }

    if (executedCount === 0) {
      logger.info('No pending migrations');
    } else {
      logger.info(`Successfully executed ${executedCount} migrations`);
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

// Run migrations
migrate();
