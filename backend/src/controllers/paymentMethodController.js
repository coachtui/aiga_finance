const PaymentMethod = require('../models/PaymentMethod');
const logger = require('../utils/logger');

class PaymentMethodController {
  /**
   * Get all payment methods for the user
   * GET /payment-methods
   */
  static async list(req, res) {
    try {
      const userId = req.user.id;

      const paymentMethods = await PaymentMethod.findAll(userId);

      res.json({
        success: true,
        data: { paymentMethods },
      });
    } catch (error) {
      logger.error('List payment methods error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch payment methods',
      });
    }
  }

  /**
   * Create a new payment method
   * POST /payment-methods
   */
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const paymentMethodData = req.body;

      const paymentMethod = await PaymentMethod.create(userId, paymentMethodData);

      res.status(201).json({
        success: true,
        data: { paymentMethod },
        message: 'Payment method created successfully',
      });
    } catch (error) {
      logger.error('Create payment method error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create payment method',
      });
    }
  }

  /**
   * Update a payment method
   * PUT /payment-methods/:id
   */
  static async update(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updateData = req.body;

      const paymentMethod = await PaymentMethod.update(id, userId, updateData);

      res.json({
        success: true,
        data: { paymentMethod },
        message: 'Payment method updated successfully',
      });
    } catch (error) {
      logger.error('Update payment method error:', error);

      if (error.message.includes('not found') || error.message.includes('unauthorized')) {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update payment method',
      });
    }
  }

  /**
   * Delete a payment method
   * DELETE /payment-methods/:id
   */
  static async delete(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      await PaymentMethod.delete(id, userId);

      res.json({
        success: true,
        message: 'Payment method deleted successfully',
      });
    } catch (error) {
      logger.error('Delete payment method error:', error);

      if (error.message.includes('not found') || error.message.includes('unauthorized')) {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete payment method',
      });
    }
  }
}

module.exports = PaymentMethodController;
