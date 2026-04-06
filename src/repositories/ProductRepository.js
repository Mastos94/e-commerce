/**
 * Product Repository
 * Handles all database operations for Product model
 */

const BaseRepository = require('./BaseRepository');
const Product = require('../models/Product');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  /**
   * Search products with filters
   * @param {Object} filters - Search filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>}
   */
  async search(filters = {}, options = {}) {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = this.getSortOrder(options.sort, options.order);

    const query = this.buildSearchQuery(filters);

    const [products, total] = await Promise.all([
      this.model.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(query)
    ]);

    return {
      data: products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    };
  }

  /**
   * Build search query from filters
   * @param {Object} filters - Search filters
   * @returns {Object}
   */
  buildSearchQuery(filters) {
    const query = {};

    // Text search
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      query.category = filters.category;
    }

    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) {
        query.price.$gte = Number(filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query.price.$lte = Number(filters.maxPrice);
      }
    }

    // Stock filter
    if (filters.inStockOnly) {
      query.stock = { $gt: 0 };
    }

    return query;
  }

  /**
   * Get sort order object
   * @param {string} sort - Sort field
   * @param {string} order - Sort direction
   * @returns {Object}
   */
  getSortOrder(sort, order) {
    const sortOrder = {};
    const direction = order === 'asc' ? 1 : -1;

    if (sort === 'price') {
      sortOrder.price = direction;
    } else if (sort === 'name') {
      sortOrder.name = direction;
    } else {
      sortOrder.createdAt = -1; // Default
    }

    return sortOrder;
  }

  /**
   * Update product stock
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity to decrease
   * @returns {Promise<Object|null>}
   */
  async decreaseStock(productId, quantity) {
    return this.model.findOneAndUpdate(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity }, updatedAt: Date.now() },
      { new: true }
    ).lean();
  }

  /**
   * Get products by IDs array
   * @param {Array<string>} ids - Array of product IDs
   * @returns {Promise<Array<Product>>}
   */
  async findByIds(ids) {
    return this.model.find({ _id: { $in: ids } }).lean();
  }
}

// Export singleton instance
module.exports = new ProductRepository();
