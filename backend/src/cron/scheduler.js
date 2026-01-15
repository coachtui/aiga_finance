const logger = require('../utils/logger');
const recurringInvoicesCron = require('./recurringInvoices');
const overdueInvoicesCron = require('./overdueInvoices');
const paymentRemindersCron = require('./paymentReminders');
const contractExpirationsCron = require('./contractExpirations');
const subscriptionRenewalsCron = require('./subscriptionRenewals');

/**
 * Initialize all cron jobs
 * Call this function on app startup
 */
const initializeScheduler = () => {
  try {
    // Check if cron jobs are enabled
    if (process.env.ENABLE_CRON_JOBS === 'false') {
      logger.info('Cron jobs are disabled (ENABLE_CRON_JOBS=false)');
      return;
    }

    logger.info('Initializing scheduled tasks...');

    // Initialize all cron jobs
    recurringInvoicesCron();
    logger.info('✓ Recurring invoices cron scheduled (Daily at 2 AM)');

    overdueInvoicesCron();
    logger.info('✓ Overdue invoices cron scheduled (Daily at 3 AM)');

    paymentRemindersCron();
    logger.info('✓ Payment reminders cron scheduled (Daily at 9 AM)');

    contractExpirationsCron();
    logger.info('✓ Contract expirations cron scheduled (Daily at 10 AM)');

    subscriptionRenewalsCron();
    logger.info('✓ Subscription renewals cron scheduled (Daily at 4 AM)');

    logger.info('All scheduled tasks initialized successfully');
  } catch (error) {
    logger.error('Error initializing scheduler:', error);
    throw error;
  }
};

module.exports = {
  initializeScheduler,
};
