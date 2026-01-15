const express = require('express');
const { authenticate } = require('../middleware/auth');
const InvoiceController = require('../controllers/invoiceController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Invoice routes
router.post('/', InvoiceController.create);
router.get('/', InvoiceController.list);
router.get('/stats', InvoiceController.getStats);
router.get('/overdue', InvoiceController.getOverdue);
router.get('/:id', InvoiceController.getById);
router.put('/:id', InvoiceController.update);
router.delete('/:id', InvoiceController.delete);
router.post('/:id/payment', InvoiceController.recordPayment);
router.post('/:id/send', InvoiceController.sendInvoice);
router.post('/:id/reminder', InvoiceController.sendReminder);
router.put('/:id/status', InvoiceController.updateStatus);
router.get('/:id/pdf', InvoiceController.getPDF);
router.get('/:id/payments', InvoiceController.getPayments);

module.exports = router;
