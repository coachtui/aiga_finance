const express = require('express');
const PaymentMethodController = require('../controllers/paymentMethodController');
const { authenticate } = require('../middleware/auth');
const { validate, paymentMethodSchema, updatePaymentMethodSchema } = require('../utils/validators');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Payment method routes
router.get('/', PaymentMethodController.list);
router.post('/', validate(paymentMethodSchema), PaymentMethodController.create);
router.put('/:id', validate(updatePaymentMethodSchema), PaymentMethodController.update);
router.delete('/:id', PaymentMethodController.delete);

module.exports = router;
