const express = require('express');
const ExpenseController = require('../controllers/expenseController');
const { authenticate } = require('../middleware/auth');
const { validate, expenseSchema, updateExpenseSchema, expenseQuerySchema } = require('../utils/validators');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Expense routes
router.post('/', validate(expenseSchema), ExpenseController.create);
router.get('/', validate(expenseQuerySchema, 'query'), ExpenseController.list);
router.get('/stats', ExpenseController.getStats);
router.get('/tags', ExpenseController.getTags);
router.get('/vendors', ExpenseController.getVendors);
router.get('/:id', ExpenseController.getById);
router.put('/:id', validate(updateExpenseSchema), ExpenseController.update);
router.delete('/:id', ExpenseController.delete);

module.exports = router;
