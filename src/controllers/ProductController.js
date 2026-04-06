/**
 * Product Controller
 * Handles product-related requests
 */

const productService = require('../services/ProductService');
const { body, validationResult } = require('express-validator');

/**
 * GET /api/v1/products
 * Get all products with filtering and pagination
 */
async function getProducts(req, res, next) {
  try {
    const products = await productService.getProducts(req.query);

    res.status(200).json({
      success: true,
      data: products,
      message: 'Products retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/products/:id
 * Get single product details
 */
async function getProduct(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/products
 * Create new product (admin only)
 */
async function createProduct(req, res, next) {
  try {
    // Validate input
    await body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Product name must be between 2 and 100 characters')
      .run(req);

    await body('description')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Product description must be at least 10 characters')
      .run(req);

    await body('price')
      .isFloat({ min: 0 })
      .withMessage('Product price must be a non-negative number')
      .run(req);

    await body('category')
      .trim()
      .notEmpty()
      .withMessage('Product category is required')
      .run(req);

    await body('stock')
      .isInt({ min: 0 })
      .withMessage('Product stock must be a non-negative integer')
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array().map(err => ({
            field: err.path,
            message: err.msg
          }))
        }
      });
    }

    const product = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/products/:id
 * Update product (admin only)
 */
async function updateProduct(req, res, next) {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/products/:id
 * Delete product (admin only)
 */
async function deleteProduct(req, res, next) {
  try {
    const product = await productService.deleteProduct(req.params.id);

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
