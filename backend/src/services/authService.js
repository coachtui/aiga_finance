const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
const logger = require('../utils/logger');
const { client: redis } = require('../config/redis');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

class AuthService {
  /**
   * Register a new user
   */
  static async register({ email, password, firstName, lastName }) {
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      firstName,
      lastName,
    });

    logger.info('User registered:', { userId: user.id, email: user.email });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Login user
   */
  static async login({ email, password, ipAddress, userAgent }) {
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if account is active
    if (!user.is_active) {
      throw new Error('Account is disabled');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await User.updateLastLogin(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user, { ipAddress, userAgent });

    logger.info('User logged in:', { userId: user.id, email: user.email });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

      // Check if session exists
      const session = await Session.findByToken(refreshToken);
      if (!session) {
        throw new Error('Invalid refresh token');
      }

      // Get user
      const user = await User.findById(decoded.userId);
      if (!user || !user.is_active) {
        throw new Error('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        accessToken,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user
   * Invalidates both access and refresh tokens
   */
  static async logout(accessToken, refreshToken) {
    try {
      // Delete session from database
      if (refreshToken) {
        await Session.delete(refreshToken);
      }

      // Add tokens to blacklist in Redis
      // Blacklist persists until token naturally expires
      if (accessToken) {
        const decoded = jwt.decode(accessToken);
        if (decoded && decoded.exp) {
          const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
          if (expiresIn > 0) {
            await redis.setEx(`blacklist:access:${accessToken}`, expiresIn, '1');
          }
        }
      }

      if (refreshToken) {
        const decoded = jwt.decode(refreshToken);
        if (decoded && decoded.exp) {
          const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
          if (expiresIn > 0) {
            await redis.setEx(`blacklist:refresh:${refreshToken}`, expiresIn, '1');
          }
        }
      }

      logger.info('User logged out and tokens blacklisted');
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Logout from all devices
   * Deletes all sessions and blacklists current access token
   */
  static async logoutAll(userId, accessToken) {
    try {
      await Session.deleteAllUserSessions(userId);

      // Blacklist current access token
      if (accessToken) {
        const decoded = jwt.decode(accessToken);
        if (decoded && decoded.exp) {
          const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
          if (expiresIn > 0) {
            await redis.setEx(`blacklist:access:${accessToken}`, expiresIn, '1');
          }
        }
      }

      logger.info('User logged out from all devices:', { userId });
    } catch (error) {
      logger.error('Logout all error:', error);
      throw error;
    }
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Check if token is blacklisted
   */
  static async isTokenBlacklisted(token, type = 'access') {
    try {
      const key = `blacklist:${type}:${token}`;
      const result = await redis.get(key);
      return result !== null;
    } catch (error) {
      logger.error('Error checking token blacklist:', error);
      // On Redis error, assume token is valid to prevent complete auth failure
      return false;
    }
  }

  /**
   * Change password
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByEmail((await User.findById(userId)).email);

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await User.update(userId, { passwordHash });

    // Logout from all devices for security
    await Session.deleteAllUserSessions(userId);

    logger.info('Password changed:', { userId });
  }

  /**
   * Generate access and refresh tokens
   */
  static async generateTokens(user, { ipAddress, userAgent } = {}) {
    // Generate access token
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        userId: user.id,
      },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    // Store refresh token in database
    await Session.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: JWT_EXPIRES_IN,
    };
  }

  /**
   * Remove sensitive data from user object
   */
  static sanitizeUser(user) {
    const { password_hash, deleted_at, ...sanitized } = user;
    return sanitized;
  }

  /**
   * Clean up expired sessions (should be run periodically)
   */
  static async cleanupExpiredSessions() {
    const count = await Session.deleteExpired();
    logger.info(`Cleaned up ${count} expired sessions`);
    return count;
  }
}

module.exports = AuthService;
