require('dotenv').config();
const { pool } = require('../config/database');
const logger = require('../utils/logger');
const { seedCategories } = require('./categories');
const { seedPaymentMethods } = require('./paymentMethods');

async function runSeeds() {
  try {
    logger.info('Starting database seeding...');

    // Seed categories first
    await seedCategories();

    // Then seed payment methods for all users
    await seedPaymentMethods();

    logger.info('Database seeding completed successfully');
    await pool.end();
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed:', error);
    await pool.end();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runSeeds();
}

module.exports = { runSeeds };
