/**
 * Orders Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Проверка авторизации
  if (!API.isAuthenticated()) {
    UI.showAlert('Пожалуйста, войдите в систему для просмотра заказов', 'warning');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
    return;
  }

  loadOrders();
});

/**
 * Загрузка списка заказов
 */
async function loadOrders() {
  const ordersList = document.getElementById('orders-list');

  try {
    const response = await API.getOrders();

    // Правильная структура: response.data.orders (для админа orders.data может содержать orders или orders)
    const ordersData = response.data.orders || response.data.data;
    
    if (ordersData && ordersData.length > 0) {
      const orders = ordersData;
      const user = API.getUser();
      const isAdmin = user && user.role === 'admin';

      ordersList.innerHTML = orders.map(order => `
        <a href="/orders/${order._id}" class="order-card-link" style="text-decoration: none; color: inherit; display: block;">
          <div class="order-card" style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow); border-left: 4px solid ${getStatusColor(order.status)}; transition: transform 0.2s, box-shadow 0.2s;">
            <!-- Шапка заказа -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
              <div>
                <div style="font-size: 1.25rem; font-weight: 600; color: var(--text-primary);">
                  Заказ #${order._id.slice(-6)}
                </div>
                <div style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem;">
                  📅 ${UI.formatDate(order.createdAt)}
                </div>
                ${isAdmin && order.userId ? `
                  <div style="color: var(--primary-color); font-size: 0.875rem; margin-top: 0.25rem;">
                    👤 ${order.userId.firstName || ''} ${order.userId.lastName || ''} (${order.userId.email})
                  </div>
                ` : ''}
              </div>
              <span class="badge" style="background: ${getStatusColor(order.status)}; color: white; padding: 0.5rem 1rem; border-radius: var(--radius); font-weight: 600;">
                ${getStatusLabel(order.status)}
              </span>
            </div>

            <!-- Итого и адрес -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.5rem;">
              <div style="flex: 1;">
                <div style="color: var(--text-secondary); font-size: 0.875rem;">
                  📍 ${order.shippingAddress}
                </div>
              </div>
              <div style="font-size: 1.25rem; font-weight: 700; color: var(--success-color);">
                ${UI.formatCurrency(order.totalAmount)}
              </div>
            </div>
            
            <div style="margin-top: 0.5rem; text-align: right; color: var(--primary-color); font-size: 0.875rem; font-weight: 500;">
              Подробнее →
            </div>
          </div>
        </a>
      `).join('');

      // Добавляем hover эффект через CSS
      const style = document.createElement('style');
      style.textContent = `
        .order-card:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        .order-card-link:hover {
          color: inherit;
        }
      `;
      document.head.appendChild(style);
    } else {
      ordersList.innerHTML = `
        <div style="text-align: center; padding: 3rem; background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
          <h2 style="color: var(--text-primary); margin-bottom: 0.5rem;">У вас пока нет заказов</h2>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Начните покупки прямо сейчас!</p>
          <a href="/products" class="btn btn-primary">Перейти к товарам</a>
        </div>
      `;
    }
  } catch (error) {
    console.error('Ошибка загрузки заказов:', error);
    
    // Если пользователь не найден - выходим и перенаправляем на вход
    if (error.message === 'User not found') {
      UI.showAlert('Сессия истекла, пожалуйста, войдите снова', 'warning');
      API.removeToken();
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }
    
    ordersList.innerHTML = `
      <div style="text-align: center; padding: 2rem; background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow);">
        <p style="color: var(--danger-color);">Ошибка загрузки заказов</p>
        <button onclick="loadOrders()" class="btn btn-primary" style="margin-top: 1rem;">Попробовать снова</button>
      </div>
    `;
  }
}

/**
 * Получить цвет статуса заказа
 */
function getStatusColor(status) {
  const colors = {
    'pending': '#f59e0b',
    'processing': '#2563eb',
    'shipped': '#10b981',
    'delivered': '#059669',
    'cancelled': '#ef4444'
  };
  return colors[status] || '#64748b';
}

/**
 * Получить метку статуса заказа
 */
function getStatusLabel(status) {
  const labels = {
    'pending': '⏳ Ожидает',
    'processing': '⚙️ В обработке',
    'shipped': '📦 Отправлен',
    'delivered': '✓ Доставлен',
    'cancelled': '✗ Отменён'
  };
  return labels[status] || status;
}
