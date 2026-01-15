const AuthService = require('../services/authService');
const logger = require('../utils/logger');

class AuthController {
  /**
   * Register a new user
   * POST /auth/register
   */
  static async register(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;

      const result = await AuthService.register({
        email,
        password,
        firstName,
        lastName,
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully',
      });
    } catch (error) {
      logger.error('Registration error:', error);

      if (error.message === 'Email already registered') {
        return res.status(409).json({
          error: 'Conflict',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Registration failed',
      });
    }
  }

  /**
   * Login user
   * POST /auth/login
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const result = await AuthService.login({
        email,
        password,
        ipAddress,
        userAgent,
      });

      res.json({
        success: true,
        data: result,
        message: 'Login successful',
      });
    } catch (error) {
      logger.error('Login error:', error);

      if (error.message.includes('Invalid') || error.message.includes('disabled')) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Login failed',
      });
    }
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  static async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      const result = await AuthService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: result,
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      logger.error('Token refresh error:', error);

      res.status(401).json({
        error: 'Unauthorized',
        message: error.message,
      });
    }
  }

  /**
   * Logout user
   * POST /auth/logout
   * Blacklists both access and refresh tokens
   */
  static async logout(req, res) {
    try {
      const { refreshToken } = req.body;

      // Extract access token from Authorization header
      const authHeader = req.headers.authorization;
      let accessToken = null;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
      }

      // Logout and blacklist both tokens
      await AuthService.logout(accessToken, refreshToken);

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      logger.error('Logout error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Logout failed',
      });
    }
  }

  /**
   * Logout from all devices
   * POST /auth/logout-all
   * Blacklists current access token and all refresh tokens for user
   */
  static async logoutAll(req, res) {
    try {
      // Extract current access token from Authorization header
      const authHeader = req.headers.authorization;
      let accessToken = null;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
      }

      await AuthService.logoutAll(req.user.id, accessToken);

      res.json({
        success: true,
        message: 'Logged out from all devices',
      });
    } catch (error) {
      logger.error('Logout all error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Logout failed',
      });
    }
  }

  /**
   * Get current user
   * GET /auth/me
   */
  static async getCurrentUser(req, res) {
    try {
      res.json({
        success: true,
        data: { user: req.user },
      });
    } catch (error) {
      logger.error('Get current user error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get user',
      });
    }
  }

  /**
   * Change password
   * POST /auth/change-password
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      await AuthService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );

      res.json({
        success: true,
        message: 'Password changed successfully. Please login again.',
      });
    } catch (error) {
      logger.error('Change password error:', error);

      if (error.message === 'Current password is incorrect') {
        return res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to change password',
      });
    }
  }
}

module.exports = AuthController;
