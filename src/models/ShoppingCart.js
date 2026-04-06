/**
 * ShoppingCart Model
 * Represents a user's shopping cart
 */

const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
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
  }
}, { _id: true });

const shoppingCartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  items: [cartItemSchema],
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

// Index for fast cart lookup
shoppingCartSchema.index({ userId: 1 });

/**
 * Virtual for total number of items in cart
 * @returns {number}
 */
shoppingCartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

/**
 * Virtual for total cart amount
 * @returns {number}
 */
shoppingCartSchema.virtual('totalAmount').get(function() {
  return this.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
});

/**
 * Instance method to add item to cart
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @param {number} price - Product price
 * @returns {Promise<ShoppingCart>}
 */
shoppingCartSchema.methods.addItem = async function(productId, quantity, price) {
  const existingItem = this.items.find(
    item => item.productId.toString() === productId.toString()
  );

  if (existingItem) {
    // Update quantity if item already exists
    existingItem.quantity += quantity;
  } else {
    // Add new item
    this.items.push({ productId, quantity, price });
  }

  this.updatedAt = Date.now();
  return this.save();
};

/**
 * Instance method to update item quantity
 * @param {string} itemId - Cart item ID
 * @param {number} quantity - New quantity
 * @returns {Promise<ShoppingCart>}
 */
shoppingCartSchema.methods.updateItemQuantity = async function(itemId, quantity) {
  const item = this.items.id(itemId);
  
  if (!item) {
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    this.items = this.items.filter(item => item._id.toString() !== itemId);
  } else {
    item.quantity = quantity;
  }

  this.updatedAt = Date.now();
  return this.save();
};

/**
 * Instance method to remove item from cart
 * @param {string} itemId - Cart item ID
 * @returns {Promise<ShoppingCart>}
 */
shoppingCartSchema.methods.removeItem = async function(itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId);
  this.updatedAt = Date.now();
  return this.save();
};

/**
 * Instance method to clear cart
 * @returns {Promise<ShoppingCart>}
 */
shoppingCartSchema.methods.clear = async function() {
  this.items = [];
  this.updatedAt = Date.now();
  return this.save();
};

/**
 * Static method to get or create cart for user
 * @param {string} userId - User ID
 * @returns {Promise<ShoppingCart>}
 */
shoppingCartSchema.statics.getOrCreateCart = async function(userId) {
  let cart = await this.findOne({ userId }).populate('items.productId', 'name price images');
  
  if (!cart) {
    cart = await this.create({ userId, items: [] });
    cart = await this.findById(cart._id).populate('items.productId', 'name price images');
  }

  return cart;
};

const ShoppingCart = mongoose.model('ShoppingCart', shoppingCartSchema);

module.exports = ShoppingCart;
