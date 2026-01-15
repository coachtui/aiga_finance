const cron = require('node-cron');
const logger = require('../utils/logger');
const db = require('../config/database');

/**
 * Cron job to mark invoices as overdue
 * Runs daily at 3 AM
 */
const overdueInvoicesCron = () => {
  cron.schedule('0 3 * * *', async () => {
    try {
      logger.info('Starting overdue invoices cron job');

      // Mark invoices as overdue if due_date has passed and status is 'sent' or 'viewed' or 'partial'
      const query = `
        UPDATE invoices
        SET status = 'overdue',
            updated_at = CURRENT_TIMESTAMP
        WHERE due_date < CURRENT_DATE
          AND status IN ('sent', 'viewed', 'partial')
          AND deleted_at IS NULL
        RETURNING id, invoice_number
      `;

      const { rows: updatedInvoices } = await db.query(query);

      if (updatedInvoices.length === 0) {
        logger.info('No invoices to mark as overdue');
        return;
      }

      logger.info(`Marked ${updatedInvoices.length} invoices as overdue`);
      updatedInvoices.forEach((inv) => {
        logger.debug(`Overdue invoice: ${inv.invoice_number}`);
      });

      logger.info('Overdue invoices cron job completed');
    } catch (error) {
      logger.error('Error in overdue invoices cron job:', error);
    }
  });
};

module.exports = overdueInvoicesCron;
