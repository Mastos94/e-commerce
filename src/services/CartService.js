/**
 * Cart Service
 * Handles shopping cart operations
 */

const ShoppingCart = require('../models/ShoppingCart');
const productRepository = require('../repositories/ProductRepository');

/**
 * Get user's shopping cart
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Shopping cart
 */
async function getCart(userId) {
  const cart = await ShoppingCart.getOrCreateCart(userId);
  
  return {
    _id: cart._id,
    userId: cart.userId,
    items: cart.items,
    totalItems: cart.totalItems,
    totalAmount: cart.totalAmount,
    updatedAt: cart.updatedAt
  };
}

/**
 * Add item to cart
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @returns {Promise<Object>} - Updated cart
 */
async function addToCart(userId, productId, quantity) {
  // Verify product exists and has stock
  const product = await productRepository.findById(productId);
  
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  if (product.stock < quantity) {
    const error = new Error('Insufficient stock');
    error.statusCode = 400;
    throw error;
  }

  // Get or create cart
  let cart = await ShoppingCart.getOrCreateCart(userId);

  // Add item to cart
  await cart.addItem(productId, quantity, product.price);

  // Return updated cart with populated products
  cart = await ShoppingCart.getOrCreateCart(userId);

  return {
    _id: cart._id,
    userId: cart.userId,
    items: cart.items,
    totalItems: cart.totalItems,
    totalAmount: cart.totalAmount,
    updatedAt: cart.updatedAt
  };
}

/**
 * Update cart item quantity
 * @param {string} userId - User ID
 * @param {string} itemId - Cart item ID
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} - Updated cart
 */
async function updateCartItem(userId, itemId, quantity) {
  let cart = await ShoppingCart.findOne({ userId }).lean();

  if (!cart) {
    const error = new Error('Cart not found');
    error.statusCode = 404;
    throw error;
  }

  // Find item in cart
  const cartItem = cart.items.find(item => item._id.toString() === itemId);

  if (!cartItem) {
    const error = new Error('Item not found in cart');
    error.statusCode = 404;
    throw error;
  }

  // Check stock if increasing quantity
  if (quantity > cartItem.quantity) {
    const product = await productRepository.findById(cartItem.productId);
    
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (product.stock < quantity) {
      const error = new Error('Insufficient stock');
      error.statusCode = 400;
      throw error;
    }
  }

  // Update cart
  cart = await ShoppingCart.findOne({ userId });
  await cart.updateItemQuantity(itemId, quantity);

  // Return updated cart
  cart = await ShoppingCart.getOrCreateCart(userId);

  return {
    _id: cart._id,
    userId: cart.userId,
    items: cart.items,
    totalItems: cart.totalItems,
    totalAmount: cart.totalAmount,
    updatedAt: cart.updatedAt
  };
}

/**
 * Remove item from cart
 * @param {string} userId - User ID
 * @param {string} itemId - Cart item ID
 * @returns {Promise<Object>} - Updated cart
 */
async function removeFromCart(userId, itemId) {
  let cart = await ShoppingCart.findOne({ userId });

  if (!cart) {
    const error = new Error('Cart not found');
    error.statusCode = 404;
    throw error;
  }

  await cart.removeItem(itemId);

  // Return updated cart
  cart = await ShoppingCart.getOrCreateCart(userId);

  return {
    _id: cart._id,
    userId: cart.userId,
    items: cart.items,
    totalItems: cart.totalItems,
    totalAmount: cart.totalAmount,
    updatedAt: cart.updatedAt
  };
}

/**
 * Clear entire cart
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Empty cart
 */
async function clearCart(userId) {
  let cart = await ShoppingCart.findOne({ userId });

  if (!cart) {
    const error = new Error('Cart not found');
    error.statusCode = 404;
    throw error;
  }

  await cart.clear();

  // Return updated cart
  cart = await ShoppingCart.getOrCreateCart(userId);

  return {
    _id: cart._id,
    userId: cart.userId,
    items: cart.items,
    totalItems: cart.totalItems,
    totalAmount: cart.totalAmount,
    updatedAt: cart.updatedAt
  };
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
