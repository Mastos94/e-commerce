/**
 * Order Controller
 * Handles order-related requests
 */

const orderService = require('../services/OrderService');
const { body, validationResult } = require('express-validator');

/**
 * POST /api/v1/orders
 * Create order from cart
 */
async function createOrder(req, res, next) {
  try {
    // Validate input
    await body('shippingAddress')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Shipping address must be at least 10 characters')
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

    const { shippingAddress } = req.body;
    const order = await orderService.createOrder(req.user._id, shippingAddress);

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/orders
 * Get user's orders (admin sees all orders)
 */
async function getUserOrders(req, res, next) {
  try {
    // If admin, get all orders, otherwise get user's orders
    if (req.user.role === 'admin') {
      const orders = await orderService.getAllOrders(req.query);
      res.status(200).json({
        success: true,
        data: orders,
        message: 'All orders retrieved successfully'
      });
    } else {
      const orders = await orderService.getUserOrders(req.user._id, req.query);
      res.status(200).json({
        success: true,
        data: orders,
        message: 'Orders retrieved successfully'
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/orders/:id
 * Get order details
 */
async function getOrder(req, res, next) {
  try {
    const order = await orderService.getOrderById(req.params.id);

    // Check if user owns this order
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions' }
      });
    }

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/orders/:id/status
 * Update order status (admin only)
 */
async function updateOrderStatus(req, res, next) {
  try {
    // Validate input
    await body('status')
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid order status')
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

    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/orders/admin/all
 * Get all orders (admin only)
 */
async function getAllOrders(req, res, next) {
  try {
    const orders = await orderService.getAllOrders(req.query);

    res.status(200).json({
      success: true,
      data: orders,
      message: 'All orders retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders
};
