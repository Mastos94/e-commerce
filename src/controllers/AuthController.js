/**
 * Auth Controller
 * Handles user registration and login
 */

const authService = require('../services/AuthService');
const { body, validationResult } = require('express-validator');

/**
 * POST /api/v1/auth/register
 * Register a new user account
 */
async function register(req, res, next) {
  try {
    // Validate input
    await body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email format')
      .run(req);

    await body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .run(req);

    await body('firstName')
      .trim()
      .isLength({ min: 2 })
      .withMessage('First name must be at least 2 characters')
      .run(req);

    await body('lastName')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Last name must be at least 2 characters')
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

    const { email, password, firstName, lastName } = req.body;

    // Register user
    const result = await authService.register({
      email,
      password,
      firstName,
      lastName
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Registration successful'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/login
 * Authenticate user and return token
 */
async function login(req, res, next) {
  try {
    // Validate input
    await body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email format')
      .run(req);

    await body('password')
      .notEmpty()
      .withMessage('Password is required')
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

    const { email, password } = req.body;

    // Login user
    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login
};
