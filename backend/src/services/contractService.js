const Contract = require('../models/Contract');
const logger = require('../utils/logger');

class ContractService {
  /**
   * Create a new contract
   */
  static async createContract(userId, contractData) {
    try {
      logger.info(`Creating contract for user ${userId}`);
      const contract = await Contract.create(userId, contractData);
      return contract;
    } catch (error) {
      logger.error('Error in createContract:', error);
      throw error;
    }
  }

  /**
   * Get contract by ID
   */
  static async getContractById(userId, contractId) {
    try {
      const contract = await Contract.findById(contractId, userId);
      if (!contract) {
        throw new Error('Contract not found');
      }
      return contract;
    } catch (error) {
      logger.error('Error in getContractById:', error);
      throw error;
    }
  }

  /**
   * Get all contracts with filters and pagination
   */
  static async getContracts(userId, filters = {}, pagination = {}) {
    try {
      const { limit = 20, page = 1 } = pagination;
      const offset = (page - 1) * limit;

      const [contracts, total] = await Promise.all([
        Contract.findWithFilters(userId, { ...filters, limit, offset }),
        Contract.countWithFilters(userId, filters),
      ]);

      return {
        contracts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error in getContracts:', error);
      throw error;
    }
  }

  /**
   * Update contract
   */
  static async updateContract(userId, contractId, updateData) {
    try {
      const contract = await Contract.update(contractId, userId, updateData);
      logger.info(`Contract ${contractId} updated`);
      return contract;
    } catch (error) {
      logger.error('Error in updateContract:', error);
      throw error;
    }
  }

  /**
   * Delete contract
   */
  static async deleteContract(userId, contractId) {
    try {
      await Contract.delete(contractId, userId);
      logger.info(`Contract ${contractId} deleted`);
      return true;
    } catch (error) {
      logger.error('Error in deleteContract:', error);
      throw error;
    }
  }

  /**
   * Get contract statistics
   */
  static async getContractStats(userId) {
    try {
      const stats = await Contract.getStatistics(userId);
      return stats;
    } catch (error) {
      logger.error('Error in getContractStats:', error);
      throw error;
    }
  }

  /**
   * Get expiring contracts
   */
  static async getExpiringContracts(userId, daysAhead = 30) {
    try {
      const contracts = await Contract.getExpiringContracts(userId, daysAhead);
      return contracts;
    } catch (error) {
      logger.error('Error in getExpiringContracts:', error);
      throw error;
    }
  }

  /**
   * Mark contract as signed
   */
  static async signContract(userId, contractId, signedBy) {
    try {
      const contract = await Contract.update(contractId, userId, {
        status: 'pending_signature',
        signedDate: new Date().toISOString().split('T')[0],
        signedBy,
      });
      logger.info(`Contract ${contractId} signed`);
      return contract;
    } catch (error) {
      logger.error('Error in signContract:', error);
      throw error;
    }
  }

  /**
   * Activate contract
   */
  static async activateContract(userId, contractId) {
    try {
      const contract = await Contract.update(contractId, userId, {
        status: 'active',
      });
      logger.info(`Contract ${contractId} activated`);
      return contract;
    } catch (error) {
      logger.error('Error in activateContract:', error);
      throw error;
    }
  }

  /**
   * Complete contract
   */
  static async completeContract(userId, contractId) {
    try {
      const contract = await Contract.update(contractId, userId, {
        status: 'completed',
      });
      logger.info(`Contract ${contractId} completed`);
      return contract;
    } catch (error) {
      logger.error('Error in completeContract:', error);
      throw error;
    }
  }

  /**
   * Cancel contract
   */
  static async cancelContract(userId, contractId) {
    try {
      const contract = await Contract.update(contractId, userId, {
        status: 'cancelled',
      });
      logger.info(`Contract ${contractId} cancelled`);
      return contract;
    } catch (error) {
      logger.error('Error in cancelContract:', error);
      throw error;
    }
  }
}

module.exports = ContractService;
