const express = require('express');
const CategoryController = require('../controllers/categoryController');

const router = express.Router();

// Public routes (categories are system-wide)
router.get('/', CategoryController.list);
router.get('/:id', CategoryController.getById);

module.exports = router;
