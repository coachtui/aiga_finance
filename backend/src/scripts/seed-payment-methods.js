require('dotenv').config();
const { query } = require('../config/database');
const logger = require('../utils/logger');

const defaultPaymentMethods = [
  {
    name: 'Business Credit Card',
    type: 'credit_card',
  },
  {
    name: 'Business Bank Account',
    type: 'bank_account',
  },
  {
    name: 'Cash',
    type: 'cash',
  },
];

async function seedPaymentMethods() {
  try {
    logger.info('Starting payment methods seed for all users...');

    // Get all users
    const usersResult = await query('SELECT id, email FROM users WHERE deleted_at IS NULL');
    const users = usersResult.rows;

    if (users.length === 0) {
      logger.info('No users found. Exiting...');
      process.exit(0);
    }

    logger.info(`Found ${users.length} users`);

    let totalSeeded = 0;

    // For each user, check if they have payment methods
    for (const user of users) {
      const existingResult = await query(
        'SELECT COUNT(*) FROM payment_methods WHERE user_id = $1 AND deleted_at IS NULL',
        [user.id]
      );

      const existingCount = parseInt(existingResult.rows[0].count, 10);

      if (existingCount > 0) {
        logger.info(`User ${user.email} already has ${existingCount} payment methods. Skipping...`);
        continue;
      }

      // Insert default payment methods for this user
      for (const pm of defaultPaymentMethods) {
        await query(
          `INSERT INTO payment_methods (user_id, name, type, is_active)
           VALUES ($1, $2, $3, $4)`,
          [user.id, pm.name, pm.type, true]
        );
        totalSeeded++;
      }

      logger.info(`✓ Seeded ${defaultPaymentMethods.length} payment methods for ${user.email}`);
    }

    logger.info(`\n✅ Successfully seeded ${totalSeeded} payment methods for ${users.length} users`);
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding payment methods:', error);
    process.exit(1);
  }
}

seedPaymentMethods();
