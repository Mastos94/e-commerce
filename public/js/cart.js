/**
 * Shopping Cart Module
 * Handles cart operations and UI updates
 */

const Cart = {
  /**
   * Cart data
   */
  data: null,

  /**
   * Initialize cart
   */
  async init() {
    if (API.isAuthenticated()) {
      await this.load();
    }
    this.updateUI();
  },

  /**
   * Load cart from API
   */
  async load() {
    try {
      const response = await API.getCart();
      if (response.success) {
        this.data = response.data;
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      
      // Handle invalid/expired token or user not found - clear auth and reload
      if (error.message === 'Invalid token' || error.message === 'Token expired' || error.message === 'User not found') {
        console.warn('Token is invalid, expired, or user not found, clearing auth data');
        API.removeToken();
        window.location.reload();
        return;
      }
      
      this.data = { items: [], totalItems: 0, totalAmount: 0 };
    }
  },

  /**
   * Add product to cart
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity
   */
  async addProduct(productId, quantity = 1) {
    console.log('Cart.addProduct вызвана с:', { productId, quantity });
    
    if (!API.isAuthenticated()) {
      console.warn('Пользователь не аутентифицирован, перенаправляем на вход');
      UI.showAlert('Пожалуйста, войдите в систему для добавления товаров в корзину', 'warning');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }

    try {
      console.log('Добавляем товар в корзину через API...');
      const response = await API.addToCart(productId, quantity);
      console.log('Ответ API при добавлении в корзину:', response);
      
      if (response.success) {
        this.data = response.data;
        this.updateUI();
        UI.showAlert('✓ Товар добавлен в корзину', 'success');
      }
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      UI.showAlert('Ошибка добавления товара: ' + (error.message || 'неизвестная ошибка'), 'danger');
    }
  },

  /**
   * Update item quantity
   * @param {string} itemId - Cart item ID
   * @param {number} quantity - New quantity
   */
  async updateItem(itemId, quantity) {
    try {
      const response = await API.updateCartItem(itemId, quantity);
      if (response.success) {
        this.data = response.data;
        this.updateUI();
      }
    } catch (error) {
      UI.showAlert(error.message || 'Failed to update cart', 'danger');
    }
  },

  /**
   * Remove item from cart
   * @param {string} itemId - Cart item ID
   */
  async removeItem(itemId) {
    try {
      const response = await API.removeFromCart(itemId);
      if (response.success) {
        this.data = response.data;
        this.updateUI();
        UI.showAlert('Item removed from cart', 'success');
      }
    } catch (error) {
      UI.showAlert(error.message || 'Failed to remove item', 'danger');
    }
  },

  /**
   * Clear entire cart
   */
  async clear() {
    try {
      const response = await API.clearCart();
      if (response.success) {
        this.data = response.data;
        this.updateUI();
        UI.showAlert('Cart cleared', 'success');
      }
    } catch (error) {
      UI.showAlert(error.message || 'Failed to clear cart', 'danger');
    }
  },

  /**
   * Update cart UI
   */
  updateUI() {
    // Update cart count badge
    const cartCount = document.getElementById('cart-count');
    if (cartCount && this.data) {
      cartCount.textContent = this.data.totalItems;
      cartCount.style.display = this.data.totalItems > 0 ? 'inline' : 'none';
    }

    // Update cart page if exists
    this.renderCartPage();
    
    // Setup event listeners for cart actions if on cart page
    this.setupCartEventListeners();
  },

  /**
   * Setup event listeners for cart actions (delegation)
   */
  setupCartEventListeners() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;

    // Remove any existing listener by cloning (simple approach)
    const newCartItems = cartItems.cloneNode(true);
    cartItems.parentNode.replaceChild(newCartItems, cartItems);

    // Add event listener
    newCartItems.addEventListener('click', async (event) => {
      const target = event.target;
      const itemId = target.getAttribute('data-item-id');
      
      if (!itemId) return;

      // Decrease quantity
      if (target.classList.contains('quantity-decrease')) {
        const input = newCartItems.querySelector(`.quantity-input-field[data-item-id="${itemId}"]`);
        const newQuantity = parseInt(input.value) - 1;
        if (newQuantity >= 1) {
          await this.updateItem(itemId, newQuantity);
        } else {
          if (confirm('Удалить этот товар из корзины?')) {
            await this.removeItem(itemId);
          }
        }
        return;
      }

      // Increase quantity
      if (target.classList.contains('quantity-increase')) {
        const input = newCartItems.querySelector(`.quantity-input-field[data-item-id="${itemId}"]`);
        const newQuantity = parseInt(input.value) + 1;
        await this.updateItem(itemId, newQuantity);
        return;
      }

      // Remove item
      if (target.classList.contains('remove-item')) {
        if (confirm('Удалить этот товар из корзины?')) {
          await this.removeItem(itemId);
        }
        return;
      }
    });

    // Handle manual input changes
    newCartItems.addEventListener('change', (event) => {
      if (event.target.classList.contains('quantity-input-field')) {
        const itemId = event.target.getAttribute('data-item-id');
        const newQuantity = parseInt(event.target.value);
        if (newQuantity >= 1) {
          this.updateItem(itemId, newQuantity);
        } else {
          event.target.value = 1;
          UI.showAlert('Количество должно быть не менее 1', 'warning');
        }
      }
    });
  },

  /**
   * Render cart page content
   */
  renderCartPage() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (!cartItems || !this.data) return;

    if (this.data.items.length === 0) {
      cartItems.innerHTML = '<p class="text-center">Ваша корзина пуста</p>';
      if (cartTotal) cartTotal.style.display = 'none';
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    // Рендерим товары корзины без inline обработчиков
    cartItems.innerHTML = this.data.items.map(item => `
      <div class="cart-item" data-item-id="${item._id}">
        <div class="cart-item-image"></div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.productId.name}</div>
          <div class="cart-item-price">${UI.formatCurrency(item.price)}</div>
        </div>
        <div class="cart-item-quantity">
          <button class="btn btn-sm btn-secondary quantity-decrease" data-item-id="${item._id}">-</button>
          <input type="number" class="quantity-input quantity-input-field" value="${item.quantity}" data-item-id="${item._id}" min="1">
          <button class="btn btn-sm btn-secondary quantity-increase" data-item-id="${item._id}">+</button>
        </div>
        <button class="btn btn-sm btn-danger remove-item" data-item-id="${item._id}">Удалить</button>
      </div>
    `).join('');

    // Обновляем итог
    if (cartTotal) {
      cartTotal.innerHTML = `
        <div class="cart-total">
          <span>Итого:</span>
          <span>${UI.formatCurrency(this.data.totalAmount)}</span>
        </div>
      `;
      cartTotal.style.display = 'block';
    }

    if (checkoutBtn) checkoutBtn.disabled = false;
  },

  /**
   * Get cart item count
   * @returns {number}
   */
  getItemCount() {
    return this.data ? this.data.totalItems : 0;
  },

  /**
   * Get cart total amount
   * @returns {number}
   */
  getTotalAmount() {
    return this.data ? this.data.totalAmount : 0;
  }
};

// Export as global
window.Cart = Cart;

/**
 * Global function for onclick handlers
 * @param {string} productId - Product ID to add
 */
window.addToCart = function(productId) {
  console.log('Глобальная addToCart вызвана с productId:', productId);
  if (Cart && typeof Cart.addProduct === 'function') {
    Cart.addProduct(productId);
  } else {
    console.error('Cart или Cart.addProduct не определён!');
    alert('Ошибка: корзина не загружена');
  }
};
