const Client = require('../models/Client');
const logger = require('../utils/logger');

class ClientService {
  /**
   * Create a new client
   */
  static async createClient(userId, clientData) {
    try {
      logger.info(`Creating client for user ${userId}`);
      const client = await Client.create(userId, clientData);
      return client;
    } catch (error) {
      logger.error('Error in createClient:', error);
      throw error;
    }
  }

  /**
   * Get client by ID
   */
  static async getClientById(userId, clientId) {
    try {
      const client = await Client.findById(clientId, userId);
      if (!client) {
        throw new Error('Client not found');
      }
      return client;
    } catch (error) {
      logger.error('Error in getClientById:', error);
      throw error;
    }
  }

  /**
   * Get all clients with filters and pagination
   */
  static async getClients(userId, filters = {}, pagination = {}) {
    try {
      const { limit = 20, page = 1 } = pagination;
      const offset = (page - 1) * limit;

      const [clients, total] = await Promise.all([
        Client.findWithFilters(userId, { ...filters, limit, offset }),
        Client.countWithFilters(userId, filters),
      ]);

      return {
        clients,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error in getClients:', error);
      throw error;
    }
  }

  /**
   * Update client
   */
  static async updateClient(userId, clientId, updateData) {
    try {
      const client = await Client.update(clientId, userId, updateData);
      logger.info(`Client ${clientId} updated`);
      return client;
    } catch (error) {
      logger.error('Error in updateClient:', error);
      throw error;
    }
  }

  /**
   * Delete client
   */
  static async deleteClient(userId, clientId) {
    try {
      await Client.delete(clientId, userId);
      logger.info(`Client ${clientId} deleted`);
      return true;
    } catch (error) {
      logger.error('Error in deleteClient:', error);
      throw error;
    }
  }

  /**
   * Get client revenue statistics
   */
  static async getClientStats(userId, clientId, dateFrom, dateTo) {
    try {
      const [invoiceStats, revenue, activeContracts, activeSubscriptions] = await Promise.all([
        Client.getInvoiceStats(clientId, userId),
        Client.getRevenueTotal(clientId, userId, dateFrom, dateTo),
        Client.getActiveContracts(clientId, userId),
        Client.getActiveSubscriptions(clientId, userId),
      ]);

      return {
        invoiceStats,
        revenue,
        activeContracts: activeContracts.length,
        activeSubscriptions: activeSubscriptions.length,
        monthlyRecurringRevenue: activeSubscriptions.reduce((sum, sub) => sum + parseFloat(sub.mrr_contribution || 0), 0),
      };
    } catch (error) {
      logger.error('Error in getClientStats:', error);
      throw error;
    }
  }
}

module.exports = ClientService;
