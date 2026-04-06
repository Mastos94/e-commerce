/**
 * Order Repository
 * Handles all database operations for Order model
 */

const BaseRepository = require('./BaseRepository');
const Order = require('../models/Order');

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  /**
   * Find orders by user with pagination
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>}
   */
  async findUserOrders(userId, options = {}) {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { userId };
    if (options.status) {
      query.status = options.status;
    }

    const [orders, total] = await Promise.all([
      this.model.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'email firstName lastName')
        .lean(),
      this.model.countDocuments(query)
    ]);

    return {
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    };
  }

  /**
   * Find orders with filters and pagination
   * @param {Object} filters - Query filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>}
   */
  async findAllWithDetails(filters = {}, options = {}) {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.model.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'email firstName lastName')
        .lean(),
      this.model.countDocuments(filters)
    ]);

    return {
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    };
  }
}

// Export singleton instance
module.exports = new OrderRepository();
