const Invoice = require('../models/Invoice');
const InvoiceItem = require('../models/InvoiceItem');
const Payment = require('../models/Payment');
const logger = require('../utils/logger');

class InvoiceService {
  /**
   * Create a new invoice with items
   */
  static async createInvoice(userId, invoiceData, items = []) {
    try {
      logger.info(`Creating invoice for user ${userId}`);

      // Generate invoice number if not provided
      let invoiceNumber = invoiceData.invoiceNumber;
      if (!invoiceNumber) {
        invoiceNumber = await Invoice.generateInvoiceNumber(userId);
      }

      // Calculate subtotal from items
      let subtotal = 0;
      items.forEach((item) => {
        subtotal += parseFloat(item.quantity) * parseFloat(item.unitPrice);
      });

      // Create invoice
      const invoicePayload = {
        ...invoiceData,
        invoiceNumber,
        subtotal,
      };

      const invoice = await Invoice.create(userId, invoicePayload);

      // Create invoice items if provided
      let invoiceItems = [];
      if (items && items.length > 0) {
        invoiceItems = await InvoiceItem.createBatch(invoice.id, items);
      }

      return {
        ...invoice,
        items: invoiceItems,
      };
    } catch (error) {
      logger.error('Error in createInvoice:', error);
      throw error;
    }
  }

  /**
   * Get invoice by ID with items and payments
   */
  static async getInvoiceById(userId, invoiceId) {
    try {
      const invoice = await Invoice.findById(invoiceId, userId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const [items, payments] = await Promise.all([
        InvoiceItem.getByInvoice(invoiceId),
        Payment.getByInvoice(invoiceId),
      ]);

      return {
        ...invoice,
        items,
        payments,
      };
    } catch (error) {
      logger.error('Error in getInvoiceById:', error);
      throw error;
    }
  }

  /**
   * Get all invoices with filters and pagination
   */
  static async getInvoices(userId, filters = {}, pagination = {}) {
    try {
      const { limit = 20, page = 1 } = pagination;
      const offset = (page - 1) * limit;

      const [invoices, total] = await Promise.all([
        Invoice.findWithFilters(userId, { ...filters, limit, offset }),
        Invoice.countWithFilters(userId, filters),
      ]);

      return {
        invoices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error in getInvoices:', error);
      throw error;
    }
  }

  /**
   * Update invoice
   */
  static async updateInvoice(userId, invoiceId, updateData) {
    try {
      const invoice = await Invoice.update(invoiceId, userId, updateData);
      logger.info(`Invoice ${invoiceId} updated`);
      return invoice;
    } catch (error) {
      logger.error('Error in updateInvoice:', error);
      throw error;
    }
  }

  /**
   * Delete invoice
   */
  static async deleteInvoice(userId, invoiceId) {
    try {
      await Invoice.delete(invoiceId, userId);
      logger.info(`Invoice ${invoiceId} deleted`);
      return true;
    } catch (error) {
      logger.error('Error in deleteInvoice:', error);
      throw error;
    }
  }

  /**
   * Record payment on invoice
   */
  static async recordPayment(userId, invoiceId, paymentData) {
    try {
      const { amount, paymentMethod, referenceNumber, notes } = paymentData;

      // Create payment record
      const payment = await Payment.create(invoiceId, {
        paymentDate: new Date().toISOString().split('T')[0],
        amount,
        paymentMethod,
        referenceNumber,
        notes,
        createdBy: userId,
      });

      // Update invoice
      const invoice = await Invoice.recordPayment(invoiceId, userId, amount);

      // Increment reminder count reset if paid
      if (invoice.status === 'paid') {
        logger.info(`Invoice ${invoiceId} paid`);
      }

      return {
        payment,
        invoice,
      };
    } catch (error) {
      logger.error('Error in recordPayment:', error);
      throw error;
    }
  }

  /**
   * Get invoice statistics
   */
  static async getInvoiceStats(userId, period = 30) {
    try {
      const stats = await Invoice.getStatistics(userId, period);
      return stats;
    } catch (error) {
      logger.error('Error in getInvoiceStats:', error);
      throw error;
    }
  }

  /**
   * Get overdue invoices
   */
  static async getOverdueInvoices(userId) {
    try {
      const invoices = await Invoice.getOverdueInvoices(userId);
      return invoices;
    } catch (error) {
      logger.error('Error in getOverdueInvoices:', error);
      throw error;
    }
  }

  /**
   * Get outstanding balance
   */
  static async getOutstandingBalance(userId) {
    try {
      const balance = await Invoice.getOutstandingBalance(userId);
      return balance;
    } catch (error) {
      logger.error('Error in getOutstandingBalance:', error);
      throw error;
    }
  }

  /**
   * Get revenue by period
   */
  static async getRevenueByPeriod(userId, dateFrom, dateTo) {
    try {
      const revenue = await Invoice.getRevenueByPeriod(userId, dateFrom, dateTo);
      return revenue;
    } catch (error) {
      logger.error('Error in getRevenueByPeriod:', error);
      throw error;
    }
  }

  /**
   * Send payment reminder
   */
  static async sendPaymentReminder(userId, invoiceId) {
    try {
      const invoiceData = await this.getInvoiceById(userId, invoiceId);
      if (!invoiceData) {
        throw new Error('Invoice not found');
      }

      // Increment reminder count
      await Invoice.incrementReminderCount(invoiceId, userId);

      logger.info(`Payment reminder sent for invoice ${invoiceId}`);
      return invoiceData;
    } catch (error) {
      logger.error('Error in sendPaymentReminder:', error);
      throw error;
    }
  }

  /**
   * Update invoice status
   */
  static async updateInvoiceStatus(userId, invoiceId, status) {
    try {
      const invoice = await Invoice.update(invoiceId, userId, { status });
      logger.info(`Invoice ${invoiceId} status updated to ${status}`);
      return invoice;
    } catch (error) {
      logger.error('Error in updateInvoiceStatus:', error);
      throw error;
    }
  }

  /**
   * Mark overdue invoices (cron job)
   */
  static async markOverdueInvoices() {
    try {
      logger.info('Marking overdue invoices');
      // This is handled via database trigger/logic
      // Can be expanded with email notifications
      return true;
    } catch (error) {
      logger.error('Error in markOverdueInvoices:', error);
      throw error;
    }
  }

  /**
   * Get invoices due for reminder
   */
  static async getInvoicesDueReminder(daysAhead = 3) {
    try {
      const invoices = await Invoice.getInvoicesDueReminder(daysAhead);
      return invoices;
    } catch (error) {
      logger.error('Error in getInvoicesDueReminder:', error);
      throw error;
    }
  }
}

module.exports = InvoiceService;
