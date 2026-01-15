const { query } = require('../config/database');
const logger = require('../utils/logger');

const defaultPaymentMethods = [
  {
    name: 'Business Credit Card',
    type: 'credit_card',
    lastFour: null,
    institutionName: null,
  },
  {
    name: 'Business Bank Account',
    type: 'bank_account',
    lastFour: null,
    institutionName: null,
  },
  {
    name: 'Cash',
    type: 'cash',
    lastFour: null,
    institutionName: null,
  },
];

async function seedPaymentMethods() {
  try {
    logger.info('Starting payment methods seed...');

    // Get all users
    const usersResult = await query('SELECT id FROM users WHERE deleted_at IS NULL');
    const users = usersResult.rows;

    if (users.length === 0) {
      logger.info('No users found. Skipping payment methods seed...');
      return;
    }

    let totalSeeded = 0;

    // For each user, check if they have payment methods
    for (const user of users) {
      const existingResult = await query(
        'SELECT COUNT(*) FROM payment_methods WHERE user_id = $1 AND deleted_at IS NULL',
        [user.id]
      );

      const existingCount = parseInt(existingResult.rows[0].count, 10);

      if (existingCount > 0) {
        logger.info(`User ${user.id} already has payment methods. Skipping...`);
        continue;
      }

      // Insert default payment methods for this user
      for (const pm of defaultPaymentMethods) {
        await query(
          `INSERT INTO payment_methods (user_id, name, type, last_four, institution_name, is_active)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [user.id, pm.name, pm.type, pm.lastFour, pm.institutionName, true]
        );
        totalSeeded++;
      }

      logger.info(`Seeded ${defaultPaymentMethods.length} payment methods for user ${user.id}`);
    }

    logger.info(`Successfully seeded ${totalSeeded} payment methods for ${users.length} users`);
  } catch (error) {
    logger.error('Error seeding payment methods:', error);
    throw error;
  }
}

module.exports = { seedPaymentMethods };
