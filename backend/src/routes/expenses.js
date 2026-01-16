const express = require('express');
const ExpenseController = require('../controllers/expenseController');
const bulkImportController = require('../controllers/bulkImportController');
const { authenticate } = require('../middleware/auth');
const { validate, expenseSchema, updateExpenseSchema, expenseQuerySchema } = require('../utils/validators');
const { upload } = require('../middleware/upload');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Bulk import routes (must be before /:id route to avoid conflicts)
router.post('/bulk-import', upload.array('files', 10), bulkImportController.uploadAndExtract);
router.get('/bulk-import/:sessionId', bulkImportController.getSessionData);
router.post('/bulk-confirm', bulkImportController.confirmImport);

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
