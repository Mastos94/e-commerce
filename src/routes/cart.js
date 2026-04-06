/**
 * Cart Routes
 */

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/CartController');
const { authenticate } = require('../middleware/auth');

// All cart routes require authentication
router.use(authenticate);

// GET /api/v1/cart - Get user's cart
router.get('/', cartController.getCart);

// POST /api/v1/cart/items - Add item to cart
router.post('/items', cartController.addToCart);

// PUT /api/v1/cart/items/:itemId - Update cart item
router.put('/items/:itemId', cartController.updateCartItem);

// DELETE /api/v1/cart/items/:itemId - Remove item from cart
router.delete('/items/:itemId', cartController.removeFromCart);

// DELETE /api/v1/cart - Clear cart
router.delete('/', cartController.clearCart);

module.exports = router;
