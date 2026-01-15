const Joi = require('joi');

// Email validation
const email = Joi.string()
  .email()
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  });

// Password validation
const password = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must not exceed 128 characters',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    'any.required': 'Password is required',
  });

// Registration schema
const registerSchema = Joi.object({
  email,
  password,
  firstName: Joi.string().min(1).max(100).optional().messages({
    'string.min': 'First name must not be empty',
    'string.max': 'First name must not exceed 100 characters',
  }),
  lastName: Joi.string().min(1).max(100).optional().messages({
    'string.min': 'Last name must not be empty',
    'string.max': 'Last name must not exceed 100 characters',
  }),
});

// Login schema
const loginSchema = Joi.object({
  email,
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

// Refresh token schema
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
});

// Update user schema
const updateUserSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).optional(),
  lastName: Joi.string().min(1).max(100).optional(),
  email: Joi.string().email().optional(),
}).min(1);

// Expense schema
const expenseSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Amount must be positive',
    'any.required': 'Amount is required',
  }),
  categoryId: Joi.string().uuid().optional().allow(null),
  paymentMethodId: Joi.string().uuid().optional().allow(null),
  transactionDate: Joi.date().max('now').required().messages({
    'any.required': 'Transaction date is required',
    'date.max': 'Transaction date cannot be in the future',
  }),
  description: Joi.string().max(1000).optional().allow(''),
  vendorName: Joi.string().max(200).optional().allow(''),
  notes: Joi.string().max(2000).optional().allow(''),
  currency: Joi.string().length(3).uppercase().default('USD'),
  exchangeRate: Joi.number().positive().default(1.0),
  isRecurring: Joi.boolean().default(false),
  recurrenceRules: Joi.object().optional().allow(null),
  isReimbursable: Joi.boolean().default(false),
  isBillable: Joi.boolean().default(false),
  isTaxDeductible: Joi.boolean().default(true),
  tags: Joi.array()
    .items(Joi.string().max(50).pattern(/^[a-z0-9-]+$/))
    .max(10)
    .optional(),
  status: Joi.string()
    .valid('pending', 'approved', 'rejected', 'paid')
    .default('pending'),
});

// Update expense schema (all fields optional)
const updateExpenseSchema = Joi.object({
  amount: Joi.number().positive().precision(2).optional(),
  categoryId: Joi.string().uuid().optional().allow(null),
  paymentMethodId: Joi.string().uuid().optional().allow(null),
  transactionDate: Joi.date().max('now').optional(),
  description: Joi.string().max(1000).optional().allow(''),
  vendorName: Joi.string().max(200).optional().allow(''),
  notes: Joi.string().max(2000).optional().allow(''),
  currency: Joi.string().length(3).uppercase().optional(),
  exchangeRate: Joi.number().positive().optional(),
  isRecurring: Joi.boolean().optional(),
  recurrenceRules: Joi.object().optional().allow(null),
  isReimbursable: Joi.boolean().optional(),
  isBillable: Joi.boolean().optional(),
  isTaxDeductible: Joi.boolean().optional(),
  tags: Joi.array()
    .items(Joi.string().max(50).pattern(/^[a-z0-9-]+$/))
    .max(10)
    .optional(),
  status: Joi.string().valid('pending', 'approved', 'rejected', 'paid').optional(),
}).min(1);

// Expense query/filter schema
const expenseQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string()
    .valid('transaction_date', 'amount', 'amount_usd', 'created_at', 'vendor_name')
    .default('transaction_date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  categoryIds: Joi.alternatives()
    .try(Joi.string().uuid(), Joi.array().items(Joi.string().uuid()))
    .optional(),
  paymentMethodIds: Joi.alternatives()
    .try(Joi.string().uuid(), Joi.array().items(Joi.string().uuid()))
    .optional(),
  tags: Joi.alternatives()
    .try(Joi.string(), Joi.array().items(Joi.string()))
    .optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional(),
  amountMin: Joi.number().min(0).optional(),
  amountMax: Joi.number().positive().optional(),
  search: Joi.string().max(200).optional(),
  status: Joi.string().valid('pending', 'approved', 'rejected', 'paid').optional(),
});

// Payment method schema
const paymentMethodSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'any.required': 'Payment method name is required',
    'string.empty': 'Payment method name cannot be empty',
  }),
  type: Joi.string()
    .valid('bank_account', 'credit_card', 'cash', 'other')
    .required()
    .messages({
      'any.required': 'Payment method type is required',
      'any.only': 'Type must be one of: bank_account, credit_card, cash, other',
    }),
  lastFour: Joi.string().length(4).pattern(/^[0-9]+$/).optional().allow('', null).messages({
    'string.length': 'Last four digits must be exactly 4 digits',
    'string.pattern.base': 'Last four digits must contain only numbers',
  }),
  institutionName: Joi.string().max(100).optional().allow('', null),
  isActive: Joi.boolean().default(true),
});

// Update payment method schema
const updatePaymentMethodSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  type: Joi.string().valid('bank_account', 'credit_card', 'cash', 'other').optional(),
  lastFour: Joi.string().length(4).pattern(/^[0-9]+$/).optional().allow('', null),
  institutionName: Joi.string().max(100).optional().allow('', null),
  isActive: Joi.boolean().optional(),
}).min(1);

// Validation middleware factory
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = source === 'query' ? req.query : req.body;
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        error: 'Validation Error',
        details: errors,
      });
    }

    // Replace with validated/sanitized values
    if (source === 'query') {
      req.query = value;
    } else {
      req.body = value;
    }

    next();
  };
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateUserSchema,
  expenseSchema,
  updateExpenseSchema,
  expenseQuerySchema,
  paymentMethodSchema,
  updatePaymentMethodSchema,
};
