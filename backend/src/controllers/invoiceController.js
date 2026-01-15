const InvoiceService = require('../services/invoiceService');
const logger = require('../utils/logger');

class InvoiceController {
  /**
   * Create a new invoice with items
   * POST /invoices
   */
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const { items, ...invoiceData } = req.body;

      const invoice = await InvoiceService.createInvoice(userId, invoiceData, items);

      res.status(201).json({
        success: true,
        data: { invoice },
        message: 'Invoice created successfully',
      });
    } catch (error) {
      logger.error('Create invoice error:', error);

      if (error.message.includes('Invalid')) {
        return res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create invoice',
      });
    }
  }

  /**
   * Get all invoices with filters and pagination
   * GET /invoices
   */
  static async list(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, ...filters } = req.query;

      const result = await InvoiceService.getInvoices(userId, filters, { page: parseInt(page), limit: parseInt(limit) });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('List invoices error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch invoices',
      });
    }
  }

  /**
   * Get a single invoice by ID with items and payments
   * GET /invoices/:id
   */
  static async getById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const invoice = await InvoiceService.getInvoiceById(userId, id);

      res.json({
        success: true,
        data: { invoice },
      });
    } catch (error) {
      logger.error('Get invoice error:', error);

      if (error.message === 'Invoice not found') {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch invoice',
      });
    }
  }

  /**
   * Update an invoice
   * PUT /invoices/:id
   */
  static async update(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updateData = req.body;

      const invoice = await InvoiceService.updateInvoice(userId, id, updateData);

      res.json({
        success: true,
        data: { invoice },
        message: 'Invoice updated successfully',
      });
    } catch (error) {
      logger.error('Update invoice error:', error);

      if (error.message.includes('not found') || error.message.includes('unauthorized')) {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update invoice',
      });
    }
  }

  /**
   * Delete an invoice
   * DELETE /invoices/:id
   */
  static async delete(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      await InvoiceService.deleteInvoice(userId, id);

      res.json({
        success: true,
        message: 'Invoice deleted successfully',
      });
    } catch (error) {
      logger.error('Delete invoice error:', error);

      if (error.message.includes('not found') || error.message.includes('unauthorized')) {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete invoice',
      });
    }
  }

  /**
   * Record payment on invoice
   * POST /invoices/:id/payment
   */
  static async recordPayment(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const paymentData = req.body;

      const result = await InvoiceService.recordPayment(userId, id, paymentData);

      res.json({
        success: true,
        data: result,
        message: 'Payment recorded successfully',
      });
    } catch (error) {
      logger.error('Record payment error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to record payment',
      });
    }
  }

  /**
   * Get invoice statistics
   * GET /invoices/stats
   */
  static async getStats(req, res) {
    try {
      const userId = req.user.id;
      const { period = '30d' } = req.query;

      const stats = await InvoiceService.getInvoiceStats(userId, parseInt(period));

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      logger.error('Get invoice stats error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch invoice statistics',
      });
    }
  }

  /**
   * Get overdue invoices
   * GET /invoices/overdue
   */
  static async getOverdue(req, res) {
    try {
      const userId = req.user.id;

      const invoices = await InvoiceService.getOverdueInvoices(userId);

      res.json({
        success: true,
        data: { invoices },
      });
    } catch (error) {
      logger.error('Get overdue invoices error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch overdue invoices',
      });
    }
  }

  /**
   * Send invoice via email
   * POST /invoices/:id/send
   */
  static async sendInvoice(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Phase 3: Implement PDF generation and email sending
      // For now, just update status to 'sent'
      const invoice = await InvoiceService.updateInvoiceStatus(userId, id, 'sent');

      res.json({
        success: true,
        data: { invoice },
        message: 'Invoice sent successfully',
      });
    } catch (error) {
      logger.error('Send invoice error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to send invoice',
      });
    }
  }

  /**
   * Send payment reminder
   * POST /invoices/:id/reminder
   */
  static async sendReminder(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Phase 3: Implement email sending
      const invoice = await InvoiceService.sendPaymentReminder(userId, id);

      res.json({
        success: true,
        data: { invoice },
        message: 'Payment reminder sent successfully',
      });
    } catch (error) {
      logger.error('Send reminder error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to send payment reminder',
      });
    }
  }

  /**
   * Update invoice status
   * PUT /invoices/:id/status
   */
  static async updateStatus(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { status } = req.body;

      const invoice = await InvoiceService.updateInvoiceStatus(userId, id, status);

      res.json({
        success: true,
        data: { invoice },
        message: 'Invoice status updated successfully',
      });
    } catch (error) {
      logger.error('Update invoice status error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update invoice status',
      });
    }
  }

  /**
   * Get invoice PDF
   * GET /invoices/:id/pdf
   */
  static async getPDF(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Phase 3: Implement PDF generation and retrieval
      res.json({
        success: true,
        message: 'PDF generation will be implemented in Phase 3',
      });
    } catch (error) {
      logger.error('Get PDF error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get invoice PDF',
      });
    }
  }

  /**
   * Get payment history for invoice
   * GET /invoices/:id/payments
   */
  static async getPayments(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const invoice = await InvoiceService.getInvoiceById(userId, id);

      res.json({
        success: true,
        data: { payments: invoice.payments },
      });
    } catch (error) {
      logger.error('Get payments error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch payment history',
      });
    }
  }
}

module.exports = InvoiceController;
