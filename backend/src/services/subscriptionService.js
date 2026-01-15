const Subscription = require('../models/Subscription');
const logger = require('../utils/logger');

class SubscriptionService {
  /**
   * Create a new subscription
   */
  static async createSubscription(userId, subscriptionData) {
    try {
      logger.info(`Creating subscription for user ${userId}`);
      const subscription = await Subscription.create(userId, subscriptionData);
      return subscription;
    } catch (error) {
      logger.error('Error in createSubscription:', error);
      throw error;
    }
  }

  /**
   * Get subscription by ID
   */
  static async getSubscriptionById(userId, subscriptionId) {
    try {
      const subscription = await Subscription.findById(subscriptionId, userId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      return subscription;
    } catch (error) {
      logger.error('Error in getSubscriptionById:', error);
      throw error;
    }
  }

  /**
   * Get all subscriptions with filters and pagination
   */
  static async getSubscriptions(userId, filters = {}, pagination = {}) {
    try {
      const { limit = 20, page = 1 } = pagination;
      const offset = (page - 1) * limit;

      const [subscriptions, total] = await Promise.all([
        Subscription.findWithFilters(userId, { ...filters, limit, offset }),
        Subscription.countWithFilters(userId, filters),
      ]);

      return {
        subscriptions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error in getSubscriptions:', error);
      throw error;
    }
  }

  /**
   * Update subscription
   */
  static async updateSubscription(userId, subscriptionId, updateData) {
    try {
      const subscription = await Subscription.update(subscriptionId, userId, updateData);
      logger.info(`Subscription ${subscriptionId} updated`);
      return subscription;
    } catch (error) {
      logger.error('Error in updateSubscription:', error);
      throw error;
    }
  }

  /**
   * Delete subscription
   */
  static async deleteSubscription(userId, subscriptionId) {
    try {
      await Subscription.delete(subscriptionId, userId);
      logger.info(`Subscription ${subscriptionId} deleted`);
      return true;
    } catch (error) {
      logger.error('Error in deleteSubscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(userId, subscriptionId, reason) {
    try {
      const subscription = await Subscription.update(subscriptionId, userId, {
        status: 'cancelled',
        cancellationDate: new Date().toISOString().split('T')[0],
        cancellationReason: reason,
      });
      logger.info(`Subscription ${subscriptionId} cancelled`);
      return subscription;
    } catch (error) {
      logger.error('Error in cancelSubscription:', error);
      throw error;
    }
  }

  /**
   * Pause subscription
   */
  static async pauseSubscription(userId, subscriptionId) {
    try {
      const subscription = await Subscription.update(subscriptionId, userId, {
        status: 'paused',
      });
      logger.info(`Subscription ${subscriptionId} paused`);
      return subscription;
    } catch (error) {
      logger.error('Error in pauseSubscription:', error);
      throw error;
    }
  }

  /**
   * Resume subscription
   */
  static async resumeSubscription(userId, subscriptionId) {
    try {
      const subscription = await Subscription.update(subscriptionId, userId, {
        status: 'active',
      });
      logger.info(`Subscription ${subscriptionId} resumed`);
      return subscription;
    } catch (error) {
      logger.error('Error in resumeSubscription:', error);
      throw error;
    }
  }

  /**
   * Calculate MRR for user
   */
  static async calculateMRR(userId) {
    try {
      const mrr = await Subscription.calculateMRR(userId);
      return mrr;
    } catch (error) {
      logger.error('Error in calculateMRR:', error);
      throw error;
    }
  }

  /**
   * Calculate ARR for user
   */
  static async calculateARR(userId) {
    try {
      const arr = await Subscription.calculateARR(userId);
      return arr;
    } catch (error) {
      logger.error('Error in calculateARR:', error);
      throw error;
    }
  }

  /**
   * Get MRR breakdown by client
   */
  static async getMRRBreakdown(userId) {
    try {
      const breakdown = await Subscription.getMRRBreakdown(userId);
      return breakdown;
    } catch (error) {
      logger.error('Error in getMRRBreakdown:', error);
      throw error;
    }
  }

  /**
   * Get churn analytics
   */
  static async getChurnAnalytics(userId, period = 30) {
    try {
      const churnData = await Subscription.getChurnRate(userId, period);
      return churnData;
    } catch (error) {
      logger.error('Error in getChurnAnalytics:', error);
      throw error;
    }
  }

  /**
   * Get upcoming renewals
   */
  static async getUpcomingRenewals(userId, daysAhead = 30) {
    try {
      const renewals = await Subscription.getUpcomingRenewals(userId, daysAhead);
      return renewals;
    } catch (error) {
      logger.error('Error in getUpcomingRenewals:', error);
      throw error;
    }
  }

  /**
   * Update next billing date
   */
  static async updateNextBillingDate(userId, subscriptionId) {
    try {
      const subscription = await Subscription.updateNextBillingDate(subscriptionId, userId);
      logger.info(`Subscription ${subscriptionId} next billing date updated`);
      return subscription;
    } catch (error) {
      logger.error('Error in updateNextBillingDate:', error);
      throw error;
    }
  }

  /**
   * Get subscriptions due for billing (for cron job)
   */
  static async getSubscriptionsDueBilling(limit = 100) {
    try {
      const subscriptions = await Subscription.getSubscriptionsDueBilling(limit);
      return subscriptions;
    } catch (error) {
      logger.error('Error in getSubscriptionsDueBilling:', error);
      throw error;
    }
  }
}

module.exports = SubscriptionService;
