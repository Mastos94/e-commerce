/**
 * Cart Controller
 * Handles shopping cart operations
 */

const cartService = require('../services/CartService');
const { body, validationResult } = require('express-validator');

/**
 * GET /api/v1/cart
 * Get current user's shopping cart
 */
async function getCart(req, res, next) {
  try {
    const cart = await cartService.getCart(req.user._id);

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Cart retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/cart/items
 * Add item to cart
 */
async function addToCart(req, res, next) {
  try {
    // Validate input
    await body('productId')
      .isMongoId()
      .withMessage('Invalid product ID')
      .run(req);

    await body('quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1')
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

    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(req.user._id, productId, quantity);

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Item added to cart successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/cart/items/:itemId
 * Update cart item quantity
 */
async function updateCartItem(req, res, next) {
  try {
    // Validate input
    await body('quantity')
      .isInt({ min: 0 })
      .withMessage('Quantity must be a non-negative integer')
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

    const { itemId } = req.params;
    const { quantity } = req.body;
    const cart = await cartService.updateCartItem(req.user._id, itemId, quantity);

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Cart updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/cart/items/:itemId
 * Remove item from cart
 */
async function removeFromCart(req, res, next) {
  try {
    const { itemId } = req.params;
    const cart = await cartService.removeFromCart(req.user._id, itemId);

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Item removed from cart'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/cart
 * Clear entire cart
 */
async function clearCart(req, res, next) {
  try {
    const cart = await cartService.clearCart(req.user._id);

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Cart cleared'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
