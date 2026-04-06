/**
 * Base Repository Pattern
 * Provides common database operations for all repositories
 */

class BaseRepository {
  /**
   * @param {mongoose.Model} model - Mongoose model
   */
  constructor(model) {
    this.model = model;
  }

  /**
   * Find document by ID
   * @param {string} id - Document ID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return this.model.findById(id).lean();
  }

  /**
   * Find all documents with optional filters and pagination
   * @param {Object} filters - Query filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Documents and pagination info
   */
  async findAll(filters = {}, options = {}) {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = options.sort || { createdAt: -1 };

    const [documents, total] = await Promise.all([
      this.model.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(filters)
    ]);

    return {
      data: documents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    };
  }

  /**
   * Create new document
   * @param {Object} data - Document data
   * @returns {Promise<Object>}
   */
  async create(data) {
    const document = await this.model.create(data);
    return document.toObject();
  }

  /**
   * Update document by ID
   * @param {string} id - Document ID
   * @param {Object} data - Update data
   * @returns {Promise<Object|null>}
   */
  async updateById(id, data) {
    return this.model.findByIdAndUpdate(
      id,
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).lean();
  }

  /**
   * Delete document by ID
   * @param {string} id - Document ID
   * @returns {Promise<Object|null>}
   */
  async deleteById(id) {
    return this.model.findByIdAndDelete(id).lean();
  }

  /**
   * Count documents with filters
   * @param {Object} filters - Query filters
   * @returns {Promise<number>}
   */
  async count(filters = {}) {
    return this.model.countDocuments(filters);
  }
}

module.exports = BaseRepository;
