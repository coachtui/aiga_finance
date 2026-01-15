const express = require('express');
const { authenticate } = require('../middleware/auth');
const ContractController = require('../controllers/contractController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Contract routes
router.post('/', ContractController.create);
router.get('/', ContractController.list);
router.get('/stats', ContractController.getStats);
router.get('/expiring', ContractController.getExpiring);
router.get('/:id', ContractController.getById);
router.put('/:id', ContractController.update);
router.delete('/:id', ContractController.delete);
router.post('/:id/sign', ContractController.sign);
router.post('/:id/activate', ContractController.activate);
router.post('/:id/complete', ContractController.complete);
router.post('/:id/cancel', ContractController.cancel);

module.exports = router;
