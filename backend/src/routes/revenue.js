const express = require('express');
const { authenticate } = require('../middleware/auth');
const RevenueController = require('../controllers/revenueController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Revenue analytics routes
router.get('/dashboard', RevenueController.getDashboard);
router.get('/trends', RevenueController.getTrends);
router.get('/by-category', RevenueController.getByCategory);
router.get('/by-client', RevenueController.getByClient);
router.get('/mrr', RevenueController.getMRR);
router.get('/arr', RevenueController.getARR);
router.get('/receivables', RevenueController.getReceivables);
router.get('/cash-flow', RevenueController.getCashFlow);
router.get('/vs-expenses', RevenueController.getVsExpenses);

module.exports = router;
