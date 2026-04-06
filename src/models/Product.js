/**
 * Product Model
 * Represents a product in the e-commerce catalog
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters'],
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    minlength: [10, 'Product description must be at least 10 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Product price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'Product stock is required'],
    min: [0, 'Product stock cannot be negative'],
    default: 0
  },
  images: [{
    type: String
  }],
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

// Create text index for search functionality
productSchema.index({ name: 'text', description: 'text' });

// Create indexes for common queries
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

/**
 * Virtual for checking if product is in stock
 * @returns {boolean}
 */
productSchema.virtual('isInStock').get(function() {
  return this.stock > 0;
});

/**
 * Static method to search products
 * @param {Object} filters - Search filters
 * @returns {Promise<Array<Product>>}
 */
productSchema.statics.search = async function(filters = {}) {
  const query = {};

  // Text search
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  // Category filter
  if (filters.category && filters.category !== 'all') {
    query.category = filters.category;
  }

  // Price range filter
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) {
      query.price.$gte = Number(filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query.price.$lte = Number(filters.maxPrice);
    }
  }

  // Stock filter
  if (filters.inStockOnly) {
    query.stock = { $gt: 0 };
  }

  return this.find(query);
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
