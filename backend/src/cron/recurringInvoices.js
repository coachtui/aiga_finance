const cron = require('node-cron');
const logger = require('../utils/logger');
const db = require('../config/database');
const InvoiceService = require('../services/invoiceService');
const SubscriptionService = require('../services/subscriptionService');

/**
 * Cron job to generate invoices for subscriptions with upcoming billing dates
 * Runs daily at 2 AM
 */
const recurringInvoicesCron = () => {
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('Starting recurring invoices cron job');

      // Get all active subscriptions where next_billing_date <= TODAY
      const query = `
        SELECT s.*, c.id as client_id, c.company_name, c.contact_email
        FROM subscriptions s
        JOIN clients c ON s.client_id = c.id
        WHERE s.status = 'active'
          AND s.next_billing_date <= CURRENT_DATE
          AND s.deleted_at IS NULL
      `;

      const { rows: subscriptions } = await db.query(query);

      if (subscriptions.length === 0) {
        logger.info('No recurring invoices to generate');
        return;
      }

      logger.info(`Found ${subscriptions.length} subscriptions to invoice`);

      for (const subscription of subscriptions) {
        try {
          // Generate invoice from subscription
          const invoiceData = {
            clientId: subscription.client_id,
            subscriptionId: subscription.id,
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + (subscription.payment_terms || 30) * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            status: 'draft',
            notes: `Recurring billing for ${subscription.name}`,
            items: [
              {
                description: subscription.name,
                quantity: 1,
                unit_price: subscription.amount,
              },
            ],
          };

          // Create invoice
          const invoice = await InvoiceService.createInvoice(
            subscription.user_id,
            invoiceData,
            invoiceData.items
          );

          // Update subscription next_billing_date
          const nextBillingDate = SubscriptionService.calculateNextBillingDate(subscription);
          await db.query(
            'UPDATE subscriptions SET next_billing_date = $1 WHERE id = $2',
            [nextBillingDate, subscription.id]
          );

          logger.info(`Invoice generated for subscription ${subscription.id}: ${invoice.invoice_number}`);
        } catch (error) {
          logger.error(`Error generating invoice for subscription ${subscription.id}:`, error);
        }
      }

      logger.info('Recurring invoices cron job completed');
    } catch (error) {
      logger.error('Error in recurring invoices cron job:', error);
    }
  });
};

module.exports = recurringInvoicesCron;
