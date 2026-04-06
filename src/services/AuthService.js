/**
 * Auth Service
 * Handles user registration, login, and token generation
 */

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const userRepository = require('../repositories/UserRepository');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - User and token
 */
async function register(userData) {
  // Check if user already exists
  const existingUser = await userRepository.findByEmail(userData.email);
  
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 400;
    throw error;
  }

  // Create new user (password will be hashed in model pre-save hook)
  const user = await userRepository.create({
    email: userData.email,
    password: userData.password,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: 'user'
  });

  // Generate JWT token
  const token = generateToken(user._id);

  // Return user without password
  const userResponse = {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    createdAt: user.createdAt
  };

  return { user: userResponse, token };
}

/**
 * Authenticate user and return token
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User and token
 */
async function login(email, password) {
  // Find user with password
  const user = await userRepository.findByEmailWithPassword(email);

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const token = generateToken(user._id);

  // Return user without password
  const userResponse = {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role
  };

  return { user: userResponse, token };
}

/**
 * Generate JWT token for user
 * @param {string} userId - User ID
 * @returns {string} - JWT token
 */
function generateToken(userId) {
  return jwt.sign(
    { userId },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
}

module.exports = {
  register,
  login
};
