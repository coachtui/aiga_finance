const ContractService = require('../services/contractService');
const logger = require('../utils/logger');

class ContractController {
  /**
   * Create a new contract
   * POST /contracts
   */
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const contractData = req.body;

      const contract = await ContractService.createContract(userId, contractData);

      res.status(201).json({
        success: true,
        data: { contract },
        message: 'Contract created successfully',
      });
    } catch (error) {
      logger.error('Create contract error:', error);

      if (error.message.includes('Invalid')) {
        return res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create contract',
      });
    }
  }

  /**
   * Get all contracts with filters and pagination
   * GET /contracts
   */
  static async list(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, ...filters } = req.query;

      const result = await ContractService.getContracts(userId, filters, { page: parseInt(page), limit: parseInt(limit) });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('List contracts error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch contracts',
      });
    }
  }

  /**
   * Get a single contract by ID
   * GET /contracts/:id
   */
  static async getById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const contract = await ContractService.getContractById(userId, id);

      res.json({
        success: true,
        data: { contract },
      });
    } catch (error) {
      logger.error('Get contract error:', error);

      if (error.message === 'Contract not found') {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch contract',
      });
    }
  }

  /**
   * Update a contract
   * PUT /contracts/:id
   */
  static async update(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updateData = req.body;

      const contract = await ContractService.updateContract(userId, id, updateData);

      res.json({
        success: true,
        data: { contract },
        message: 'Contract updated successfully',
      });
    } catch (error) {
      logger.error('Update contract error:', error);

      if (error.message.includes('not found') || error.message.includes('unauthorized')) {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update contract',
      });
    }
  }

  /**
   * Delete a contract
   * DELETE /contracts/:id
   */
  static async delete(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      await ContractService.deleteContract(userId, id);

      res.json({
        success: true,
        message: 'Contract deleted successfully',
      });
    } catch (error) {
      logger.error('Delete contract error:', error);

      if (error.message.includes('not found') || error.message.includes('unauthorized')) {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete contract',
      });
    }
  }

  /**
   * Get contract statistics
   * GET /contracts/stats
   */
  static async getStats(req, res) {
    try {
      const userId = req.user.id;

      const stats = await ContractService.getContractStats(userId);

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      logger.error('Get contract stats error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch contract statistics',
      });
    }
  }

  /**
   * Get expiring contracts
   * GET /contracts/expiring
   */
  static async getExpiring(req, res) {
    try {
      const userId = req.user.id;
      const { daysAhead = 30 } = req.query;

      const contracts = await ContractService.getExpiringContracts(userId, parseInt(daysAhead));

      res.json({
        success: true,
        data: { contracts },
      });
    } catch (error) {
      logger.error('Get expiring contracts error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch expiring contracts',
      });
    }
  }

  /**
   * Sign contract
   * POST /contracts/:id/sign
   */
  static async sign(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { signedBy } = req.body;

      const contract = await ContractService.signContract(userId, id, signedBy);

      res.json({
        success: true,
        data: { contract },
        message: 'Contract signed successfully',
      });
    } catch (error) {
      logger.error('Sign contract error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to sign contract',
      });
    }
  }

  /**
   * Activate contract
   * POST /contracts/:id/activate
   */
  static async activate(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const contract = await ContractService.activateContract(userId, id);

      res.json({
        success: true,
        data: { contract },
        message: 'Contract activated successfully',
      });
    } catch (error) {
      logger.error('Activate contract error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to activate contract',
      });
    }
  }

  /**
   * Complete contract
   * POST /contracts/:id/complete
   */
  static async complete(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const contract = await ContractService.completeContract(userId, id);

      res.json({
        success: true,
        data: { contract },
        message: 'Contract completed successfully',
      });
    } catch (error) {
      logger.error('Complete contract error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to complete contract',
      });
    }
  }

  /**
   * Cancel contract
   * POST /contracts/:id/cancel
   */
  static async cancel(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const contract = await ContractService.cancelContract(userId, id);

      res.json({
        success: true,
        data: { contract },
        message: 'Contract cancelled successfully',
      });
    } catch (error) {
      logger.error('Cancel contract error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to cancel contract',
      });
    }
  }
}

module.exports = ContractController;
