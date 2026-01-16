-- Seed default categories for expenses
INSERT INTO categories (name, type, icon, color, is_default, created_at, updated_at)
VALUES
  -- Expense categories
  ('Office Supplies', 'expense', '📎', '#3B82F6', true, NOW(), NOW()),
  ('Travel', 'expense', '✈️', '#8B5CF6', true, NOW(), NOW()),
  ('Meals & Entertainment', 'expense', '🍽️', '#EC4899', true, NOW(), NOW()),
  ('Software & Subscriptions', 'expense', '💻', '#10B981', true, NOW(), NOW()),
  ('Marketing & Advertising', 'expense', '📢', '#F59E0B', true, NOW(), NOW()),
  ('Professional Services', 'expense', '👔', '#6366F1', true, NOW(), NOW()),
  ('Equipment', 'expense', '🛠️', '#14B8A6', true, NOW(), NOW()),
  ('Utilities', 'expense', '⚡', '#EF4444', true, NOW(), NOW()),
  ('Rent & Facilities', 'expense', '🏢', '#78716C', true, NOW(), NOW()),
  ('Insurance', 'expense', '🛡️', '#06B6D4', true, NOW(), NOW()),
  ('Taxes & Licenses', 'expense', '📋', '#84CC16', true, NOW(), NOW()),
  ('Bank Fees', 'expense', '🏦', '#F97316', true, NOW(), NOW()),
  ('Miscellaneous', 'expense', '📦', '#A855F7', true, NOW(), NOW()),

  -- Revenue categories
  ('Product Sales', 'revenue', '💰', '#10B981', true, NOW(), NOW()),
  ('Service Revenue', 'revenue', '🤝', '#3B82F6', true, NOW(), NOW()),
  ('Subscription Revenue', 'revenue', '🔄', '#8B5CF6', true, NOW(), NOW()),
  ('Consulting Fees', 'revenue', '💼', '#F59E0B', true, NOW(), NOW()),
  ('License Fees', 'revenue', '📜', '#06B6D4', true, NOW(), NOW()),
  ('Other Revenue', 'revenue', '💵', '#84CC16', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Note: Payment methods are user-specific, so they should be created by users themselves
-- This migration only creates default categories that are available to all users
