const express = require('express');
const authRoutes = require('./auth');
const expenseRoutes = require('./expenses');
const categoryRoutes = require('./categories');
const paymentMethodRoutes = require('./paymentMethods');
const attachmentRoutes = require('./attachments');
const clientRoutes = require('./clients');
const contractRoutes = require('./contracts');
const subscriptionRoutes = require('./subscriptions');
const invoiceRoutes = require('./invoices');
const revenueRoutes = require('./revenue');

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/expenses', expenseRoutes);
router.use('/categories', categoryRoutes);
router.use('/payment-methods', paymentMethodRoutes);
router.use('/attachments', attachmentRoutes);

// Revenue Management routes (Week 5)
router.use('/clients', clientRoutes);
router.use('/contracts', contractRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/revenue', revenueRoutes);

// Future routes:
// router.use('/plaid', plaidRoutes);

module.exports = router;
