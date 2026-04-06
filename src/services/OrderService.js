/**
 * Order Service
 * Handles order creation and management
 */

const mongoose = require('mongoose');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const ShoppingCart = require('../models/ShoppingCart');
const productRepository = require('../repositories/ProductRepository');
const orderRepository = require('../repositories/OrderRepository');

/**
 * Create order from cart
 * @param {string} userId - User ID
 * @param {string} shippingAddress - Shipping address
 * @returns {Promise<Object>} - Created order with items
 */
async function createOrder(userId, shippingAddress) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get user's cart
    const cart = await ShoppingCart.findOne({ userId }).session(session);

    if (!cart || cart.items.length === 0) {
      const error = new Error('Cart is empty');
      error.statusCode = 400;
      throw error;
    }

    // Verify stock for all items
    for (const cartItem of cart.items) {
      const product = await productRepository.findById(cartItem.productId);
      
      if (!product) {
        const error = new Error(`Product ${cartItem.productId} not found`);
        error.statusCode = 404;
        throw error;
      }

      if (product.stock < cartItem.quantity) {
        const error = new Error(`Insufficient stock for product ${product.name}`);
        error.statusCode = 400;
        throw error;
      }
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);

    // Create order
    const order = await Order.create([{
      userId,
      totalAmount,
      shippingAddress,
      status: 'pending'
    }], { session });

    // Create order items
    const orderItems = cart.items.map(cartItem => ({
      orderId: order[0]._id,
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      price: cartItem.price,
      subtotal: cartItem.quantity * cartItem.price
    }));

    await OrderItem.insertMany(orderItems, { session });

    // Decrease product stock
    for (const cartItem of cart.items) {
      await productRepository.decreaseStock(cartItem.productId, cartItem.quantity);
    }

    // Clear cart
    await cart.clear({ session });

    // Commit transaction
    await session.commitTransaction();

    // Return order with items
    return await getOrderById(order[0]._id);
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Get order by ID with items
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} - Order details
 */
async function getOrderById(orderId) {
  const order = await Order.findById(orderId)
    .populate('userId', 'email firstName lastName')
    .lean();

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  // Get order items
  const items = await OrderItem.findByOrderId(orderId);

  return {
    ...order,
    items: items.map(item => ({
      productId: item.productId._id,
      productName: item.productId.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal
    }))
  };
}

/**
 * Get user's orders with pagination
 * @param {string} userId - User ID
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>} - Orders and pagination
 */
async function getUserOrders(userId, queryParams = {}) {
  const { page, limit, status } = queryParams;

  const options = {
    page,
    limit,
    status
  };

  return await Order.findUserOrders(userId, options);
}

/**
 * Update order status (admin only)
 * @param {string} orderId - Order ID
 * @param {string} newStatus - New status
 * @returns {Promise<Object>} - Updated order
 */
async function updateOrderStatus(orderId, newStatus) {
  const order = await Order.findById(orderId);

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  await order.updateStatus(newStatus);

  return await getOrderById(orderId);
}

/**
 * Get all orders (admin only)
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>} - Orders and pagination
 */
async function getAllOrders(queryParams = {}) {
  const { page, limit, status } = queryParams;

  const filters = {};
  if (status) {
    filters.status = status;
  }

  return await orderRepository.findAll(filters, { page, limit });
}

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  getAllOrders
};
