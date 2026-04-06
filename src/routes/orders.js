/**
 * Order Routes
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const { authenticate, authorize } = require('../middleware/auth');

// All order routes require authentication
router.use(authenticate);

// POST /api/v1/orders - Create order
router.post('/', orderController.createOrder);

// GET /api/v1/orders - Get user's orders
router.get('/', orderController.getUserOrders);

// GET /api/v1/orders/:id - Get order details
router.get('/:id', orderController.getOrder);

// PUT /api/v1/orders/:id/status - Update order status (admin only)
router.put('/:id/status', authorize(['admin']), orderController.updateOrderStatus);

// GET /api/v1/orders/admin/all - Get all orders (admin only)
router.get('/admin/all', authorize(['admin']), orderController.getAllOrders);

module.exports = router;
