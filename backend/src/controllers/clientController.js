const ClientService = require('../services/clientService');
const logger = require('../utils/logger');

class ClientController {
  /**
   * Create a new client
   * POST /clients
   */
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const clientData = req.body;

      const client = await ClientService.createClient(userId, clientData);

      res.status(201).json({
        success: true,
        data: { client },
        message: 'Client created successfully',
      });
    } catch (error) {
      logger.error('Create client error:', error);

      if (error.message.includes('Invalid')) {
        return res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create client',
      });
    }
  }

  /**
   * Get all clients with filters and pagination
   * GET /clients
   */
  static async list(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, ...filters } = req.query;

      const result = await ClientService.getClients(userId, filters, { page: parseInt(page), limit: parseInt(limit) });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('List clients error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch clients',
      });
    }
  }

  /**
   * Get a single client by ID
   * GET /clients/:id
   */
  static async getById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const client = await ClientService.getClientById(userId, id);

      res.json({
        success: true,
        data: { client },
      });
    } catch (error) {
      logger.error('Get client error:', error);

      if (error.message === 'Client not found') {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch client',
      });
    }
  }

  /**
   * Update a client
   * PUT /clients/:id
   */
  static async update(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updateData = req.body;

      const client = await ClientService.updateClient(userId, id, updateData);

      res.json({
        success: true,
        data: { client },
        message: 'Client updated successfully',
      });
    } catch (error) {
      logger.error('Update client error:', error);

      if (error.message.includes('not found') || error.message.includes('unauthorized')) {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update client',
      });
    }
  }

  /**
   * Delete a client
   * DELETE /clients/:id
   */
  static async delete(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      await ClientService.deleteClient(userId, id);

      res.json({
        success: true,
        message: 'Client deleted successfully',
      });
    } catch (error) {
      logger.error('Delete client error:', error);

      if (error.message.includes('not found') || error.message.includes('unauthorized')) {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete client',
      });
    }
  }

  /**
   * Get client statistics
   * GET /clients/:id/stats
   */
  static async getStats(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { dateFrom = this.get30DaysAgo(), dateTo = this.getToday() } = req.query;

      const stats = await ClientService.getClientStats(userId, id, dateFrom, dateTo);

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      logger.error('Get client stats error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch client statistics',
      });
    }
  }

  /**
   * Get client contracts
   * GET /clients/:id/contracts
   */
  static async getContracts(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // This will be handled by contract controller
      // For now, return placeholder
      res.json({
        success: true,
        data: { contracts: [] },
      });
    } catch (error) {
      logger.error('Get client contracts error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch client contracts',
      });
    }
  }

  /**
   * Get client subscriptions
   * GET /clients/:id/subscriptions
   */
  static async getSubscriptions(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // This will be handled by subscription controller
      // For now, return placeholder
      res.json({
        success: true,
        data: { subscriptions: [] },
      });
    } catch (error) {
      logger.error('Get client subscriptions error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch client subscriptions',
      });
    }
  }

  /**
   * Get client invoices
   * GET /clients/:id/invoices
   */
  static async getInvoices(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // This will be handled by invoice controller
      // For now, return placeholder
      res.json({
        success: true,
        data: { invoices: [] },
      });
    } catch (error) {
      logger.error('Get client invoices error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch client invoices',
      });
    }
  }

  /**
   * Helper: Get 30 days ago date
   */
  static get30DaysAgo() {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }

  /**
   * Helper: Get today's date
   */
  static getToday() {
    return new Date().toISOString().split('T')[0];
  }
}

module.exports = ClientController;
