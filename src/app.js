/**
 * Main application entry point
 * Configures Express server with middleware and routes
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

// Import configuration
const { mongodb } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

// Import error handling middleware
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// Security Middleware
// ==========================================

// Helmet - sets various HTTP headers for security
app.use(helmet());

// CORS - enable cross-origin requests
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// ==========================================
// General Middleware
// ==========================================

// Compression - compress response bodies
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ==========================================
// Static Files & View Engine
// ==========================================

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// ==========================================
// Routes
// ==========================================

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);

// Serve main pages
app.get('/', (req, res) => {
  res.render('pages/index', { title: 'Главная' });
});

app.get('/products', (req, res) => {
  res.render('pages/products', { title: 'Товары' });
});

app.get('/cart', (req, res) => {
  res.render('pages/cart', { title: 'Корзина покупок' });
});

app.get('/login', (req, res) => {
  res.render('pages/login', { title: 'Вход' });
});

app.get('/register', (req, res) => {
  res.render('pages/register', { title: 'Регистрация' });
});

// ==========================================
// Error Handling
// ==========================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ==========================================
// Database Connection & Server Start
// ==========================================

/**
 * Start the server after connecting to database
 */
async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongodb.uri, mongodb.options);
    console.log('✓ Connected to MongoDB');

    // Start listening for requests
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV}`);
      console.log(`✓ API available at http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

startServer();

module.exports = app;
