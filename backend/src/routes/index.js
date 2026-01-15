const express = require('express');
const authRoutes = require('./auth');
const expenseRoutes = require('./expenses');
const categoryRoutes = require('./categories');
const paymentMethodRoutes = require('./paymentMethods');

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/expenses', expenseRoutes);
router.use('/categories', categoryRoutes);
router.use('/payment-methods', paymentMethodRoutes);

// Future routes:
// router.use('/analytics', analyticsRoutes);
// router.use('/uploads', uploadRoutes);
// router.use('/plaid', plaidRoutes);

module.exports = router;
