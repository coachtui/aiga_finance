const SubscriptionService = require('../services/subscriptionService');
const logger = require('../utils/logger');

class SubscriptionController {
  /**
   * Create a new subscription
   * POST /subscriptions
   */
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const subscriptionData = req.body;

      const subscription = await SubscriptionService.createSubscription(userId, subscriptionData);

      res.status(201).json({
        success: true,
        data: { subscription },
        message: 'Subscription created successfully',
      });
    } catch (error) {
      logger.error('Create subscription error:', error);

      if (error.message.includes('Invalid')) {
        return res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create subscription',
      });
    }
  }

  /**
   * Get all subscriptions with filters and pagination
   * GET /subscriptions
   */
  static async list(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, ...filters } = req.query;

      const result = await SubscriptionService.getSubscriptions(userId, filters, { page: parseInt(page), limit: parseInt(limit) });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('List subscriptions error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch subscriptions',
      });
    }
  }

  /**
   * Get a single subscription by ID
   * GET /subscriptions/:id
   */
  static async getById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const subscription = await SubscriptionService.getSubscriptionById(userId, id);

      res.json({
        success: true,
        data: { subscription },
      });
    } catch (error) {
      logger.error('Get subscription error:', error);

      if (error.message === 'Subscription not found') {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch subscription',
      });
    }
  }

  /**
   * Update a subscription
   * PUT /subscriptions/:id
   */
  static async update(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updateData = req.body;

      const subscription = await SubscriptionService.updateSubscription(userId, id, updateData);

      res.json({
        success: true,
        data: { subscription },
        message: 'Subscription updated successfully',
      });
    } catch (error) {
      logger.error('Update subscription error:', error);

      if (error.message.includes('not found') || error.message.includes('unauthorized')) {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update subscription',
      });
    }
  }

  /**
   * Delete a subscription
   * DELETE /subscriptions/:id
   */
  static async delete(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      await SubscriptionService.deleteSubscription(userId, id);

      res.json({
        success: true,
        message: 'Subscription deleted successfully',
      });
    } catch (error) {
      logger.error('Delete subscription error:', error);

      if (error.message.includes('not found') || error.message.includes('unauthorized')) {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete subscription',
      });
    }
  }

  /**
   * Cancel subscription
   * POST /subscriptions/:id/cancel
   */
  static async cancel(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { reason } = req.body;

      const subscription = await SubscriptionService.cancelSubscription(userId, id, reason);

      res.json({
        success: true,
        data: { subscription },
        message: 'Subscription cancelled successfully',
      });
    } catch (error) {
      logger.error('Cancel subscription error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to cancel subscription',
      });
    }
  }

  /**
   * Pause subscription
   * POST /subscriptions/:id/pause
   */
  static async pause(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const subscription = await SubscriptionService.pauseSubscription(userId, id);

      res.json({
        success: true,
        data: { subscription },
        message: 'Subscription paused successfully',
      });
    } catch (error) {
      logger.error('Pause subscription error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to pause subscription',
      });
    }
  }

  /**
   * Resume subscription
   * POST /subscriptions/:id/resume
   */
  static async resume(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const subscription = await SubscriptionService.resumeSubscription(userId, id);

      res.json({
        success: true,
        data: { subscription },
        message: 'Subscription resumed successfully',
      });
    } catch (error) {
      logger.error('Resume subscription error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to resume subscription',
      });
    }
  }

  /**
   * Get subscription statistics (MRR, ARR, churn)
   * GET /subscriptions/stats
   */
  static async getStats(req, res) {
    try {
      const userId = req.user.id;

      const [mrr, arr, churn] = await Promise.all([
        SubscriptionService.calculateMRR(userId),
        SubscriptionService.calculateARR(userId),
        SubscriptionService.getChurnAnalytics(userId),
      ]);

      res.json({
        success: true,
        data: {
          mrr: parseFloat(mrr),
          arr: parseFloat(arr),
          churn,
        },
      });
    } catch (error) {
      logger.error('Get subscription stats error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch subscription statistics',
      });
    }
  }

  /**
   * Get MRR breakdown
   * GET /subscriptions/mrr
   */
  static async getMRR(req, res) {
    try {
      const userId = req.user.id;

      const breakdown = await SubscriptionService.getMRRBreakdown(userId);

      res.json({
        success: true,
        data: { breakdown },
      });
    } catch (error) {
      logger.error('Get MRR error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch MRR breakdown',
      });
    }
  }

  /**
   * Get upcoming renewals
   * GET /subscriptions/renewals
   */
  static async getRenewals(req, res) {
    try {
      const userId = req.user.id;
      const { daysAhead = 30 } = req.query;

      const renewals = await SubscriptionService.getUpcomingRenewals(userId, parseInt(daysAhead));

      res.json({
        success: true,
        data: { renewals },
      });
    } catch (error) {
      logger.error('Get renewals error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch upcoming renewals',
      });
    }
  }
}

module.exports = SubscriptionController;
