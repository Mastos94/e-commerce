/**
 * User Repository
 * Handles all database operations for User model
 */

const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<User|null>}
   */
  async findByEmail(email) {
    return this.model.findOne({ email: email.toLowerCase() }).lean();
  }

  /**
   * Find user by email with password (for authentication)
   * @param {string} email - User email
   * @returns {Promise<User|null>}
   */
  async findByEmailWithPassword(email) {
    return this.model.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find user by ID without password
   * @param {string} id - User ID
   * @returns {Promise<User|null>}
   */
  async findPublicById(id) {
    return this.model.findById(id).select('-password').lean();
  }
}

// Export singleton instance
module.exports = new UserRepository();
