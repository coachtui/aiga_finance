const express = require('express');
const { authenticate } = require('../middleware/auth');
const ClientController = require('../controllers/clientController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Client routes
router.post('/', ClientController.create);
router.get('/', ClientController.list);
router.get('/:id', ClientController.getById);
router.put('/:id', ClientController.update);
router.delete('/:id', ClientController.delete);
router.get('/:id/stats', ClientController.getStats);
router.get('/:id/contracts', ClientController.getContracts);
router.get('/:id/subscriptions', ClientController.getSubscriptions);
router.get('/:id/invoices', ClientController.getInvoices);

module.exports = router;
