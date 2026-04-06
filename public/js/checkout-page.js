/**
 * Checkout Page Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Проверка авторизации
  if (!API.isAuthenticated()) {
    UI.showAlert('Пожалуйста, войдите в систему для оформления заказа', 'warning');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
    return;
  }

  await loadCartSummary();
  setupCheckoutForm();
});

/**
 * Загрузка сводки корзины
 */
async function loadCartSummary() {
  try {
    const response = await API.getCart();
    
    if (response.success) {
      const cart = response.data;
      const cartItems = document.getElementById('cart-items');
      const cartTotal = document.getElementById('cart-total');

      if (cart.items.length === 0) {
        cartItems.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Ваша корзина пуста</p>';
        return;
      }

      // Отображение товаров
      cartItems.innerHTML = cart.items.map(item => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--border-color);">
          <div>
            <div style="font-weight: 600; color: var(--text-primary);">${item.productId.name}</div>
            <div style="color: var(--text-secondary); font-size: 0.875rem;">Количество: ${item.quantity}</div>
          </div>
          <div style="font-weight: 600; color: var(--text-primary);">
            ${UI.formatCurrency(item.price * item.quantity)}
          </div>
        </div>
      `).join('');

      // Итого
      cartTotal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 1.25rem; font-weight: 600; color: var(--text-primary);">Итого:</span>
          <span style="font-size: 1.5rem; font-weight: 700; color: var(--success-color);">${UI.formatCurrency(cart.totalAmount)}</span>
        </div>
      `;
      cartTotal.style.display = 'block';
    }
  } catch (error) {
    console.error('Ошибка загрузки корзины:', error);
    document.getElementById('cart-items').innerHTML = '<p style="color: var(--danger-color); text-align: center; padding: 2rem;">Ошибка загрузки корзины</p>';
  }
}

/**
 * Настройка формы оформления заказа
 */
function setupCheckoutForm() {
  const form = document.getElementById('checkout-form');
  
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const shippingAddress = document.getElementById('shippingAddress').value.trim();

    if (!shippingAddress || shippingAddress.length < 10) {
      UI.showAlert('Пожалуйста, введите корректный адрес доставки (минимум 10 символов)', 'warning');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Оформление...';

    try {
      const response = await API.createOrder(shippingAddress);
      
      if (response.success) {
        UI.showAlert('✓ Заказ успешно оформ! Перенаправляем...', 'success');
        setTimeout(() => {
          window.location.href = `/orders/${response.data._id}`;
        }, 1500);
      }
    } catch (error) {
      UI.showAlert('Ошибка оформления заказа: ' + (error.message || 'неизвестная ошибка'), 'danger');
      submitBtn.disabled = false;
      submitBtn.textContent = '✓ Оформить заказ';
    }
  });
}
