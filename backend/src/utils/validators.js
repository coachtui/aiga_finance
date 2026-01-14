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
  transactionDate: Joi.date().required().messages({
    'any.required': 'Transaction date is required',
  }),
  description: Joi.string().max(1000).optional().allow(''),
  vendorName: Joi.string().max(200).optional().allow(''),
  notes: Joi.string().max(2000).optional().allow(''),
  isRecurring: Joi.boolean().optional(),
  isReimbursable: Joi.boolean().optional(),
  isBillable: Joi.boolean().optional(),
  taxDeductible: Joi.boolean().optional(),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  currency: Joi.string().length(3).uppercase().optional(),
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

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
};
