/**
 * Product Routes
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/v1/products - Get all products (public)
router.get('/', productController.getProducts);

// GET /api/v1/products/:id - Get single product (public)
router.get('/:id', productController.getProduct);

// POST /api/v1/products - Create product (admin only)
router.post('/', authenticate, authorize(['admin']), productController.createProduct);

// PUT /api/v1/products/:id - Update product (admin only)
router.put('/:id', authenticate, authorize(['admin']), productController.updateProduct);

// DELETE /api/v1/products/:id - Delete product (admin only)
router.delete('/:id', authenticate, authorize(['admin']), productController.deleteProduct);

module.exports = router;
