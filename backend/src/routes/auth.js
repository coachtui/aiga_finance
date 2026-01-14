const express = require('express');
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, registerSchema, loginSchema, refreshTokenSchema } = require('../utils/validators');

const router = express.Router();

// Rate limiter for auth endpoints (stricter than general rate limit)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 5,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshTokenSchema), AuthController.refresh);
router.post('/logout', AuthController.logout);

// Protected routes (require authentication)
router.get('/me', authenticate, AuthController.getCurrentUser);
router.post('/logout-all', authenticate, AuthController.logoutAll);
router.post('/change-password', authenticate, AuthController.changePassword);

module.exports = router;
