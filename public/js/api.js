/**
 * API Client Module
 * Handles all async AJAX requests to the backend
 */

const API = {
  /**
   * Base URL for API requests
   */
  baseUrl: '/api/v1',

  /**
   * Get stored authentication token
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Set authentication token
   * @param {string} token - JWT token
   */
  setToken(token) {
    localStorage.setItem('token', token);
  },

  /**
   * Remove authentication token
   */
  removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get stored user data
   * @returns {Object|null}
   */
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Set stored user data
   * @param {Object} user - User data
   */
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Make HTTP request to API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    // Add authentication token
    const token = this.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Добавлен токен авторизации');
    } else {
      console.warn('Токен авторизации отсутствует');
    }

    // Add request body
    if (options.body) {
      config.body = JSON.stringify(options.body);
      console.log('Тело запроса:', options.body);
    }

    try {
      console.log(`${config.method} запрос к ${url}`);
      const response = await fetch(url, config);
      console.log('Статус ответа:', response.status);
      const data = await response.json();
      console.log('Данные ответа:', data);

      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  },

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>}
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  },

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @returns {Promise<Object>}
   */
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body
    });
  },

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @returns {Promise<Object>}
   */
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body
    });
  },

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>}
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  // ==========================================
  // Authentication API
  // ==========================================

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>}
   */
  async register(userData) {
    const response = await this.post('/auth/register', userData);
    
    if (response.success) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
    }

    return response;
  },

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>}
   */
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    
    if (response.success) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
    }

    return response;
  },

  /**
   * Logout user
   */
  logout() {
    this.removeToken();
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  // ==========================================
  // Products API
  // ==========================================

  /**
   * Get all products
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>}
   */
  async getProducts(params = {}) {
    return this.get('/products', params);
  },

  /**
   * Get single product
   * @param {string} id - Product ID
   * @returns {Promise<Object>}
   */
  async getProduct(id) {
    return this.get(`/products/${id}`);
  },

  // ==========================================
  // Cart API
  // ==========================================

  /**
   * Get user's cart
   * @returns {Promise<Object>}
   */
  async getCart() {
    return this.get('/cart');
  },

  /**
   * Add item to cart
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity
   * @returns {Promise<Object>}
   */
  async addToCart(productId, quantity) {
    return this.post('/cart/items', { productId, quantity });
  },

  /**
   * Update cart item quantity
   * @param {string} itemId - Cart item ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>}
   */
  async updateCartItem(itemId, quantity) {
    return this.put(`/cart/items/${itemId}`, { quantity });
  },

  /**
   * Remove item from cart
   * @param {string} itemId - Cart item ID
   * @returns {Promise<Object>}
   */
  async removeFromCart(itemId) {
    return this.delete(`/cart/items/${itemId}`);
  },

  /**
   * Clear cart
   * @returns {Promise<Object>}
   */
  async clearCart() {
    return this.delete('/cart');
  },

  // ==========================================
  // Orders API
  // ==========================================

  /**
   * Create order from cart
   * @param {string} shippingAddress - Shipping address
   * @returns {Promise<Object>}
   */
  async createOrder(shippingAddress) {
    return this.post('/orders', { shippingAddress });
  },

  /**
   * Get user's orders
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>}
   */
  async getOrders(params = {}) {
    return this.get('/orders', params);
  },

  /**
   * Get order details
   * @param {string} id - Order ID
   * @returns {Promise<Object>}
   */
  async getOrder(id) {
    return this.get(`/orders/${id}`);
  }
};

// Export as global
window.API = API;
