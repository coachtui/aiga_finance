const cron = require('node-cron');
const logger = require('../utils/logger');
const db = require('../config/database');
const EmailService = require('../services/emailService');

/**
 * Cron job to notify about contracts expiring soon
 * Sends notification 30 days before contract end date
 * Runs daily at 10 AM
 */
const contractExpirationsCron = () => {
  cron.schedule('0 10 * * *', async () => {
    try {
      logger.info('Starting contract expirations cron job');

      // Find contracts expiring in 30 days
      const query = `
        SELECT c.*, cl.id as client_id, cl.contact_name, cl.contact_email, cl.company_name
        FROM contracts c
        JOIN clients cl ON c.client_id = cl.id
        WHERE c.status IN ('active', 'pending_signature')
          AND c.end_date = CURRENT_DATE + INTERVAL '30 days'
          AND c.deleted_at IS NULL
      `;

      const { rows: contracts } = await db.query(query);

      if (contracts.length === 0) {
        logger.info('No contract expiration notifications to send');
        return;
      }

      logger.info(`Sending ${contracts.length} contract expiration notifications`);

      for (const contract of contracts) {
        try {
          // Send notification email
          await EmailService.sendContractExpiring(contract, contract);

          logger.info(`Contract expiration notification sent for contract ${contract.contract_number}`);
        } catch (error) {
          logger.error(`Error sending notification for contract ${contract.contract_number}:`, error);
        }
      }

      logger.info('Contract expirations cron job completed');
    } catch (error) {
      logger.error('Error in contract expirations cron job:', error);
    }
  });
};

module.exports = contractExpirationsCron;
