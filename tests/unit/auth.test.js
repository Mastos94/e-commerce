/**
 * Auth Service Tests
 */

const authService = require('../src/services/AuthService');
const userRepository = require('../src/repositories/UserRepository');

// Mock user repository
jest.mock('../src/repositories/UserRepository');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const userData = {
      email: 'test@example.com',
      password: 'TestPassword123',
      firstName: 'Test',
      lastName: 'User'
    };

    it('should register a new user successfully', async () => {
      // Mock repository methods
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        ...userData,
        role: 'user',
        createdAt: new Date()
      });

      const result = await authService.register(userData);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName
      }));
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(userData.email);
    });

    it('should throw error if email already exists', async () => {
      userRepository.findByEmail.mockResolvedValue({ email: userData.email });

      await expect(authService.register(userData)).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    const email = 'test@example.com';
    const password = 'TestPassword123';

    it('should login user with valid credentials', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email,
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      userRepository.findByEmailWithPassword.mockResolvedValue(mockUser);

      const result = await authService.login(email, password);

      expect(userRepository.findByEmailWithPassword).toHaveBeenCalledWith(email);
      expect(mockUser.comparePassword).toHaveBeenCalledWith(password);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(email);
    });

    it('should throw error for invalid email', async () => {
      userRepository.findByEmailWithPassword.mockResolvedValue(null);

      await expect(authService.login(email, password)).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for invalid password', async () => {
      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      userRepository.findByEmailWithPassword.mockResolvedValue(mockUser);

      await expect(authService.login(email, password)).rejects.toThrow('Invalid email or password');
    });
  });
});
