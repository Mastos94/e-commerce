/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens
 */

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const userRepository = require('../repositories/UserRepository');

/**
 * Middleware to authenticate requests using JWT
 * Adds user info to req.user if token is valid
 */
async function authenticate(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' }
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Get user from database
    const user = await userRepository.findPublicById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid token' }
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Token expired' }
      });
    }

    next(error);
  }
}

/**
 * Middleware to authorize users based on role
 * @param {Array<string>} roles - Allowed roles
 */
function authorize(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' }
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions' }
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize
};
