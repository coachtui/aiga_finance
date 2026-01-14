const { query } = require('../config/database');
const logger = require('../utils/logger');

const defaultCategories = [
  // Expense Categories
  {
    name: 'Development & Infrastructure',
    type: 'expense',
    description: 'Hosting, domains, APIs, software subscriptions',
    color: '#3B82F6',
    icon: 'code',
  },
  {
    name: 'Professional Services',
    type: 'expense',
    description: 'Legal, accounting, consulting',
    color: '#8B5CF6',
    icon: 'briefcase',
  },
  {
    name: 'Marketing & Sales',
    type: 'expense',
    description: 'Website, ads, trade shows, demos',
    color: '#EC4899',
    icon: 'megaphone',
  },
  {
    name: 'Equipment & Hardware',
    type: 'expense',
    description: 'Testing devices, computers, tools',
    color: '#10B981',
    icon: 'cpu',
  },
  {
    name: 'Research & Testing',
    type: 'expense',
    description: 'Site visits, equipment access, industry research',
    color: '#F59E0B',
    icon: 'flask',
  },
  {
    name: 'Administrative',
    type: 'expense',
    description: 'Business registration, insurance, office supplies',
    color: '#6B7280',
    icon: 'folder',
  },
  {
    name: 'Travel & Meetings',
    type: 'expense',
    description: 'Client visits, networking, conferences',
    color: '#EF4444',
    icon: 'plane',
  },
  {
    name: 'Education & Training',
    type: 'expense',
    description: 'Courses, certifications, books',
    color: '#14B8A6',
    icon: 'book',
  },
  {
    name: 'Salaries & Payroll',
    type: 'expense',
    description: 'Employee salaries, contractor payments',
    color: '#06B6D4',
    icon: 'users',
  },
  {
    name: 'Utilities',
    type: 'expense',
    description: 'Internet, phone, electricity',
    color: '#84CC16',
    icon: 'zap',
  },
  {
    name: 'Miscellaneous',
    type: 'expense',
    description: 'Other uncategorized expenses',
    color: '#A855F7',
    icon: 'dots',
  },

  // Revenue Categories
  {
    name: 'Equipment Inspection Subscriptions',
    type: 'revenue',
    description: 'EquipmentAI inspection service subscriptions',
    color: '#22C55E',
    icon: 'subscription',
  },
  {
    name: 'SafetyAI Licenses',
    type: 'revenue',
    description: 'SafetyAI software licenses',
    color: '#3B82F6',
    icon: 'shield',
  },
  {
    name: 'Consulting Services',
    type: 'revenue',
    description: 'Professional consulting and advisory',
    color: '#F59E0B',
    icon: 'consultant',
  },
  {
    name: 'One-time Services',
    type: 'revenue',
    description: 'Custom inspections and special projects',
    color: '#8B5CF6',
    icon: 'dollar',
  },
];

async function seedCategories() {
  try {
    logger.info('Starting category seed...');

    // Check if categories already exist
    const existing = await query('SELECT COUNT(*) FROM categories');
    if (parseInt(existing.rows[0].count, 10) > 0) {
      logger.info('Categories already seeded. Skipping...');
      return;
    }

    // Insert categories
    for (let i = 0; i < defaultCategories.length; i++) {
      const category = defaultCategories[i];
      await query(
        `INSERT INTO categories (name, type, description, color, icon, display_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          category.name,
          category.type,
          category.description,
          category.color,
          category.icon,
          i + 1,
        ]
      );
    }

    logger.info(`Successfully seeded ${defaultCategories.length} categories`);
  } catch (error) {
    logger.error('Error seeding categories:', error);
    throw error;
  }
}

module.exports = { seedCategories };
