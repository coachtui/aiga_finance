const cron = require('node-cron');
const logger = require('../utils/logger');
const db = require('../config/database');

/**
 * Cron job to process subscription renewals
 * Extends subscriptions with auto-renewal enabled
 * Runs daily at 4 AM
 */
const subscriptionRenewalsCron = () => {
  cron.schedule('0 4 * * *', async () => {
    try {
      logger.info('Starting subscription renewals cron job');

      // Find subscriptions that have expired but have auto-renewal enabled
      const query = `
        SELECT *
        FROM subscriptions
        WHERE status = 'expired'
          AND auto_renewal = true
          AND deleted_at IS NULL
      `;

      const { rows: subscriptions } = await db.query(query);

      if (subscriptions.length === 0) {
        logger.info('No subscriptions to renew');
        return;
      }

      logger.info(`Renewing ${subscriptions.length} subscriptions`);

      for (const subscription of subscriptions) {
        try {
          // Calculate new end date based on billing cycle
          const endDate = new Date();
          if (subscription.billingCycle === 'monthly') {
            endDate.setMonth(endDate.getMonth() + 1);
          } else if (subscription.billingCycle === 'quarterly') {
            endDate.setMonth(endDate.getMonth() + 3);
          } else if (subscription.billingCycle === 'annual') {
            endDate.setFullYear(endDate.getFullYear() + 1);
          }

          // Reactivate subscription
          const renewalQuery = `
            UPDATE subscriptions
            SET status = 'active',
                next_billing_date = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING id, name
          `;

          const { rows: renewed } = await db.query(renewalQuery, [
            endDate.toISOString().split('T')[0],
            subscription.id,
          ]);

          if (renewed.length > 0) {
            logger.info(`Subscription renewed: ${renewed[0].name} (ID: ${renewed[0].id})`);
          }
        } catch (error) {
          logger.error(`Error renewing subscription ${subscription.id}:`, error);
        }
      }

      logger.info('Subscription renewals cron job completed');
    } catch (error) {
      logger.error('Error in subscription renewals cron job:', error);
    }
  });
};

module.exports = subscriptionRenewalsCron;
