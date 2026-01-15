const express = require('express');
const { authenticate } = require('../middleware/auth');
const SubscriptionController = require('../controllers/subscriptionController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Subscription routes
router.post('/', SubscriptionController.create);
router.get('/', SubscriptionController.list);
router.get('/stats', SubscriptionController.getStats);
router.get('/mrr', SubscriptionController.getMRR);
router.get('/renewals', SubscriptionController.getRenewals);
router.get('/:id', SubscriptionController.getById);
router.put('/:id', SubscriptionController.update);
router.delete('/:id', SubscriptionController.delete);
router.post('/:id/cancel', SubscriptionController.cancel);
router.post('/:id/pause', SubscriptionController.pause);
router.post('/:id/resume', SubscriptionController.resume);

module.exports = router;
