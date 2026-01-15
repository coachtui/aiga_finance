const cron = require('node-cron');
const logger = require('../utils/logger');
const db = require('../config/database');
const EmailService = require('../services/emailService');

/**
 * Cron job to send payment reminders for invoices approaching due date
 * Sends reminders 7 days before due date
 * Runs daily at 9 AM
 */
const paymentRemindersCron = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      logger.info('Starting payment reminders cron job');

      // Find invoices due in 7 days that haven't been paid
      const query = `
        SELECT i.*, c.id as client_id, c.contact_name, c.contact_email, c.company_name
        FROM invoices i
        JOIN clients c ON i.client_id = c.id
        WHERE i.status IN ('sent', 'viewed', 'partial')
          AND i.due_date = CURRENT_DATE + INTERVAL '7 days'
          AND i.balance_due > 0
          AND i.deleted_at IS NULL
      `;

      const { rows: invoices } = await db.query(query);

      if (invoices.length === 0) {
        logger.info('No payment reminders to send');
        return;
      }

      logger.info(`Sending ${invoices.length} payment reminders`);

      for (const invoice of invoices) {
        try {
          // Get user info
          const userQuery = 'SELECT * FROM users WHERE id = $1';
          const { rows: users } = await db.query(userQuery, [invoice.user_id]);
          const user = users[0];

          // Send reminder email
          await EmailService.sendPaymentReminder(invoice, invoice);

          logger.info(`Payment reminder sent for invoice ${invoice.invoice_number}`);
        } catch (error) {
          logger.error(`Error sending reminder for invoice ${invoice.invoice_number}:`, error);
        }
      }

      logger.info('Payment reminders cron job completed');
    } catch (error) {
      logger.error('Error in payment reminders cron job:', error);
    }
  });
};

module.exports = paymentRemindersCron;
