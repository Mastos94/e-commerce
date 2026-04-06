/**
 * Error Handling Middleware
 * Handles 404s and global errors
 */

/**
 * Handle 404 - Resource Not Found
 */
function notFoundHandler(req, res) {
  // Check if client expects JSON
  if (req.accepts('json')) {
    return res.status(404).json({
      success: false,
      error: { message: 'Resource not found' }
    });
  }
  
  // Render 404 page for browser requests
  res.status(404).render('pages/error', {
    title: 'Page Not Found',
    statusCode: 404,
    message: 'The page you are looking for does not exist.'
  });
}

/**
 * Global error handler
 * Catches all unhandled errors
 */
function errorHandler(err, req, res, next) {
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Check if client expects JSON
  if (req.accepts('json')) {
    return res.status(statusCode).json({
      success: false,
      error: { message }
    });
  }

  // Render error page for browser requests
  res.status(statusCode).render('pages/error', {
    title: 'Error',
    statusCode,
    message
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
