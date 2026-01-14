const { query } = require('../config/database');

class Session {
  /**
   * Create a new session
   */
  static async create({ userId, token, expiresAt, ipAddress, userAgent }) {
    const result = await query(
      `INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, token, expiresAt, ipAddress, userAgent]
    );
    return result.rows[0];
  }

  /**
   * Find session by token
   */
  static async findByToken(token) {
    const result = await query(
      'SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    return result.rows[0];
  }

  /**
   * Delete session
   */
  static async delete(token) {
    await query('DELETE FROM sessions WHERE token = $1', [token]);
  }

  /**
   * Delete all user sessions
   */
  static async deleteAllUserSessions(userId) {
    await query('DELETE FROM sessions WHERE user_id = $1', [userId]);
  }

  /**
   * Delete expired sessions
   */
  static async deleteExpired() {
    const result = await query(
      'DELETE FROM sessions WHERE expires_at < NOW()'
    );
    return result.rowCount;
  }

  /**
   * Get user sessions
   */
  static async getUserSessions(userId) {
    const result = await query(
      `SELECT id, ip_address, user_agent, created_at, expires_at
       FROM sessions
       WHERE user_id = $1 AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }
}

module.exports = Session;
