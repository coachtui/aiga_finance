const Category = require('../models/Category');
const logger = require('../utils/logger');

class CategoryController {
  /**
   * Get all categories
   * GET /categories
   */
  static async list(req, res) {
    try {
      const { type } = req.query;

      const categories = await Category.findAll({ type });

      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      logger.error('List categories error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch categories',
      });
    }
  }

  /**
   * Get a single category by ID
   * GET /categories/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);

      if (!category) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Category not found',
        });
      }

      res.json({
        success: true,
        data: { category },
      });
    } catch (error) {
      logger.error('Get category error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch category',
      });
    }
  }
}

module.exports = CategoryController;
