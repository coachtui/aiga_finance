const express = require('express');
const authRoutes = require('./auth');

const router = express.Router();

// API routes
router.use('/auth', authRoutes);

// Future routes will be added here:
// router.use('/expenses', expenseRoutes);
// router.use('/categories', categoryRoutes);
// router.use('/payment-methods', paymentMethodRoutes);
// router.use('/analytics', analyticsRoutes);
// router.use('/uploads', uploadRoutes);
// router.use('/plaid', plaidRoutes);

module.exports = router;
