/**
 * Product Service
 * Handles business logic for product operations
 */

const productRepository = require('../repositories/ProductRepository');

/**
 * Get all products with filtering and pagination
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>} - Products and pagination info
 */
async function getProducts(queryParams = {}) {
  const {
    page,
    limit,
    category,
    search,
    minPrice,
    maxPrice,
    inStockOnly,
    sort,
    order
  } = queryParams;

  const filters = {
    category,
    search,
    minPrice,
    maxPrice,
    inStockOnly: inStockOnly === 'true'
  };

  const options = {
    page,
    limit,
    sort,
    order
  };

  return await productRepository.search(filters, options);
}

/**
 * Get single product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Object>} - Product details
 */
async function getProductById(id) {
  const product = await productRepository.findById(id);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  return product;
}

/**
 * Create new product (admin only)
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} - Created product
 */
async function createProduct(productData) {
  return await productRepository.create(productData);
}

/**
 * Update product (admin only)
 * @param {string} id - Product ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} - Updated product
 */
async function updateProduct(id, updateData) {
  const product = await productRepository.updateById(id, updateData);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  return product;
}

/**
 * Delete product (admin only)
 * @param {string} id - Product ID
 * @returns {Promise<Object>} - Deleted product
 */
async function deleteProduct(id) {
  const product = await productRepository.deleteById(id);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  return product;
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
