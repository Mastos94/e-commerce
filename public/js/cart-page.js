/**
 * Cart Page Initialization
 * Handles cart page functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Страница корзины: DOM загружен');
  
  if (!API.isAuthenticated()) {
    UI.showAlert('Пожалуйста, войдите в систему для просмотра корзины', 'warning');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
    return;
  }
  
  loadCart();
});

/**
 * Load cart items
 */
async function loadCart() {
  const container = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  
  try {
    const response = await API.getCart();
    
    if (response.success) {
      const cart = response.data;
      console.log('Корзина загружена:', cart);
      
      if (!cart.items || cart.items.length === 0) {
        container.innerHTML = '<p class="text-center" style="padding: 3rem; color: #64748b;">Ваша корзина пуста</p>';
        cartTotal.style.display = 'none';
        checkoutBtn.disabled = true;
        return;
      }
      
      // Рендерим товары корзины
      container.innerHTML = cart.items.map(item => `
        <div class="cart-item" data-item-id="${item._id}">
          <div class="cart-item-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">📦</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.productId.name}</div>
            <div class="cart-item-price">${UI.formatCurrency(item.price)}</div>
          </div>
          <div class="cart-item-quantity">
            <button class="btn btn-sm btn-secondary quantity-decrease" data-item-id="${item._id}">-</button>
            <input type="number" class="quantity-input quantity-input-field" value="${item.quantity}" min="1" data-item-id="${item._id}">
            <button class="btn btn-sm btn-secondary quantity-increase" data-item-id="${item._id}">+</button>
          </div>
          <button class="btn btn-sm btn-danger remove-item" data-item-id="${item._id}">Удалить</button>
        </div>
      `).join('');
      
      // Обновляем итог
      cartTotal.innerHTML = `
        <div class="cart-total">
          <span>Итого (${cart.totalItems} шт.):</span>
          <span>${UI.formatCurrency(cart.totalAmount)}</span>
        </div>
      `;
      cartTotal.style.display = 'block';
      checkoutBtn.disabled = false;
      
      // Привязываем обработчики через делегирование
      setupCartEventListeners();
    }
  } catch (error) {
    console.error('Ошибка загрузки корзины:', error);
    container.innerHTML = '<p class="text-center" style="padding: 3rem; color: #ef4444;">Ошибка загрузки корзины</p>';
    UI.showAlert('Не удалось загрузить корзину', 'danger');
  }
}

/**
 * Setup event listeners for cart actions
 */
function setupCartEventListeners() {
  const container = document.getElementById('cart-items');
  
  // Делегирование событий
  container.addEventListener('click', async function(event) {
    const target = event.target;
    const itemId = target.getAttribute('data-item-id');
    
    if (!itemId) return;
    
    // Уменьшение количества
    if (target.classList.contains('quantity-decrease')) {
      const input = container.querySelector(`.quantity-input-field[data-item-id="${itemId}"]`);
      const newQuantity = parseInt(input.value) - 1;
      
      if (newQuantity >= 1) {
        await updateCartItemQuantity(itemId, newQuantity);
      } else {
        // Если количество = 0, спрашиваем об удалении
        if (confirm('Удалить этот товар из корзины?')) {
          await removeCartItem(itemId);
        }
      }
      return;
    }
    
    // Увеличение количества
    if (target.classList.contains('quantity-increase')) {
      const input = container.querySelector(`.quantity-input-field[data-item-id="${itemId}"]`);
      const newQuantity = parseInt(input.value) + 1;
      await updateCartItemQuantity(itemId, newQuantity);
      return;
    }
    
    // Удаление товара
    if (target.classList.contains('remove-item')) {
      if (confirm('Удалить этот товар из корзины?')) {
        await removeCartItem(itemId);
      }
      return;
    }
  });
  
  // Обработка ручного ввода в поле количества
  container.addEventListener('change', function(event) {
    if (event.target.classList.contains('quantity-input-field')) {
      const itemId = event.target.getAttribute('data-item-id');
      const newQuantity = parseInt(event.target.value);
      
      if (newQuantity >= 1) {
        updateCartItemQuantity(itemId, newQuantity);
      } else {
        event.target.value = 1;
        UI.showAlert('Количество должно быть не менее 1', 'warning');
      }
    }
  });
}

/**
 * Update cart item quantity
 */
async function updateCartItemQuantity(itemId, quantity) {
  try {
    console.log('Обновляем количество товара:', { itemId, quantity });
    const response = await API.updateCartItem(itemId, quantity);
    
    if (response.success) {
      console.log('Количество обновлено:', response.data);
      await loadCart(); // Перезагружаем корзину
      UI.showAlert('✓ Корзина обновлена', 'success');
    }
  } catch (error) {
    console.error('Ошибка обновления корзины:', error);
    UI.showAlert('Ошибка обновления: ' + (error.message || 'неизвестная ошибка'), 'danger');
  }
}

/**
 * Remove item from cart
 */
async function removeCartItem(itemId) {
  try {
    console.log('Удаляем товар из корзины:', itemId);
    const response = await API.removeFromCart(itemId);
    
    if (response.success) {
      console.log('Товар удалён:', response.data);
      await loadCart(); // Перезагружаем корзину
      UI.showAlert('✓ Товар удалён из корзины', 'success');
    }
  } catch (error) {
    console.error('Ошибка удаления из корзины:', error);
    UI.showAlert('Ошибка удаления: ' + (error.message || 'неизвестная ошибка'), 'danger');
  }
}
