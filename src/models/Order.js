/**
 * Order Model
 * Represents a customer order in the system
 */

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  shippingAddress: {
    type: String,
    required: [true, 'Shipping address is required'],
    trim: true,
    minlength: [10, 'Shipping address must be at least 10 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for common queries
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

/**
 * Virtual for order items (populated via separate query)
 */
orderSchema.virtual('items', {
  ref: 'OrderItem',
  localField: '_id',
  foreignField: 'orderId',
  justOne: false
});

/**
 * Static method to find orders by user with pagination
 * @param {string} userId - User ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} - Orders and pagination info
 */
orderSchema.statics.findUserOrders = async function(userId, options = {}) {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { userId };

  // Status filter
  if (options.status) {
    query.status = options.status;
  }

  const [orders, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'email firstName lastName'),
    this.countDocuments(query)
  ]);

  return {
    orders,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit
    }
  };
};

/**
 * Instance method to update order status
 * @param {string} newStatus - New order status
 * @returns {Promise<Order>}
 */
orderSchema.methods.updateStatus = async function(newStatus) {
  const validTransitions = {
    'pending': ['processing', 'cancelled'],
    'processing': ['shipped', 'cancelled'],
    'shipped': ['delivered'],
    'delivered': [],
    'cancelled': []
  };

  const allowedStatuses = validTransitions[this.status];
  if (!allowedStatuses.includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
  }

  this.status = newStatus;
  return this.save();
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
