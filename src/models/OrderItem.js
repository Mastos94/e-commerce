/**
 * OrderItem Model
 * Represents an individual item within an order
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID is required']
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
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
orderItemSchema.index({ orderId: 1 });
orderItemSchema.index({ productId: 1 });

/**
 * Virtual for product details (populated via separate query)
 */
orderItemSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true
});

/**
 * Pre-save hook to calculate subtotal
 */
orderItemSchema.pre('save', function(next) {
  this.subtotal = this.quantity * this.price;
  next();
});

/**
 * Static method to create order items
 * @param {Array} items - Array of order item data
 * @returns {Promise<Array<OrderItem>>}
 */
orderItemSchema.statics.createOrderItems = async function(items) {
  const orderItems = items.map(item => ({
    orderId: item.orderId,
    productId: item.productId,
    quantity: item.quantity,
    price: item.price,
    subtotal: item.quantity * item.price
  }));

  return this.insertMany(orderItems);
};

/**
 * Static method to find items by order ID with product details
 * @param {string} orderId - Order ID
 * @returns {Promise<Array<OrderItem>>}
 */
orderItemSchema.statics.findByOrderId = async function(orderId) {
  return this.find({ orderId })
    .populate('productId', 'name price images')
    .lean();
};

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;
