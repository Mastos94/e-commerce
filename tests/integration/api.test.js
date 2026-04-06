/**
 * Integration Tests for API Endpoints
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

// Setup test environment
beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Set environment variable for database
  process.env.MONGODB_URI = uri;
  
  // Import app after database is ready
  app = require('../src/app');
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('API Integration Tests', () => {
  
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(userData.email);
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'TestPassword123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject registration with short password', async () => {
      const userData = {
        email: 'test2@example.com',
        password: 'short',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'login@test.com',
          password: 'LoginPassword123',
          firstName: 'Login',
          lastName: 'Test'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@test.com',
          password: 'LoginPassword123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should reject login with wrong password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@test.com',
          password: 'WrongPassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/products', () => {
    it('should return empty products list', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('pagination');
    });
  });

  describe('Authentication Required Routes', () => {
    it('should reject cart access without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/cart')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject order access without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
