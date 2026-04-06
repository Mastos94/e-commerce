/**
 * Order Detail Page Logic
 */

let currentOrder = null;

document.addEventListener('DOMContentLoaded', () => {
  // Проверка авторизации
  if (!API.isAuthenticated()) {
    UI.showAlert('Пожалуйста, войдите в систему для просмотра заказа', 'warning');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
    return;
  }

  loadOrderDetail();
});

/**
 * Загрузка деталей заказа
 */
async function loadOrderDetail() {
  const orderDetail = document.getElementById('order-detail');
  
  // Получаем ID заказа из URL
  const pathParts = window.location.pathname.split('/');
  const orderId = pathParts[pathParts.length - 1];

  if (!orderId) {
    orderDetail.innerHTML = `
      <div style="text-align: center; padding: 3rem; background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow);">
        <p style="color: var(--danger-color);">ID заказа не указан</p>
        <a href="/orders" class="btn btn-primary" style="margin-top: 1rem;">Вернуться к заказам</a>
      </div>
    `;
    return;
  }

  try {
    const response = await API.getOrder(orderId);

    if (!response.success || !response.data) {
      throw new Error('Заказ не найден или произошла ошибка');
    }

    currentOrder = response.data;
    
    // Проверяем что _id существует
    if (!currentOrder || !currentOrder._id) {
      throw new Error('Некорректные данные заказа');
    }
    
    const user = API.getUser();
    const isAdmin = user && user.role === 'admin';

    orderDetail.innerHTML = `
        <!-- Информация о заказе -->
        <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow); border-left: 4px solid ${getStatusColor(currentOrder.status)};">
          <!-- Шапка -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid var(--border-color);">
            <div>
              <h2 style="margin: 0; color: var(--text-primary);">Заказ #${currentOrder._id.slice(-6)}</h2>
              <p style="margin: 0.5rem 0 0 0; color: var(--text-secondary);">
                📅 ${UI.formatDate(currentOrder.createdAt)}
              </p>
            </div>
            <span id="order-status-badge" class="badge" style="background: ${getStatusColor(currentOrder.status)}; color: white; padding: 0.75rem 1.5rem; border-radius: var(--radius); font-weight: 600; font-size: 1rem;">
              ${getStatusLabel(currentOrder.status)}
            </span>
          </div>

          ${isAdmin ? renderAdminStatusSelector() : ''}

          <!-- Товары -->
          <div style="margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1rem; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
              Товары в заказе
            </h3>
            ${currentOrder.items.map(item => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--border-color);">
                <div>
                  <div style="font-weight: 600; color: var(--text-primary);">${item.productName}</div>
                  <div style="color: var(--text-secondary); font-size: 0.875rem;">
                    Количество: ${item.quantity} × ${UI.formatCurrency(item.price)}
                  </div>
                </div>
                <div style="font-weight: 700; color: var(--text-primary); font-size: 1.125rem;">
                  ${UI.formatCurrency(item.subtotal)}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Итого и адрес -->
          <div style="background: var(--light-bg); padding: 1.5rem; border-radius: var(--radius-lg);">
            <div style="margin-bottom: 1rem;">
              <div style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.25rem;">📍 Адрес доставки:</div>
              <div style="color: var(--text-primary); font-weight: 500;">${currentOrder.shippingAddress}</div>
            </div>
            ${isAdmin && currentOrder.userId ? `
              <div style="margin-bottom: 1rem;">
                <div style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.25rem;">👤 Покупатель:</div>
                <div style="color: var(--text-primary); font-weight: 500;">
                  ${currentOrder.userId.firstName || ''} ${currentOrder.userId.lastName || ''} (${currentOrder.userId.email})
                </div>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 2px solid var(--border-color);">
              <span style="font-size: 1.25rem; font-weight: 600; color: var(--text-primary);">Итого:</span>
              <span style="font-size: 1.75rem; font-weight: 700; color: var(--success-color);">${UI.formatCurrency(currentOrder.totalAmount)}</span>
            </div>
          </div>
        </div>
      `;

      // Если админ - привязываем обработчик изменения статуса
      if (isAdmin) {
        const statusSelect = document.getElementById('admin-status-select');
        if (statusSelect) {
          statusSelect.addEventListener('change', handleStatusChange);
        }
      }
  } catch (error) {
    console.error('Ошибка загрузки заказа:', error);
    orderDetail.innerHTML = `
      <div style="text-align: center; padding: 3rem; background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow);">
        <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
        <h2 style="color: var(--danger-color); margin-bottom: 0.5rem;">Ошибка загрузки заказа</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">${error.message || 'Заказ не найден или произошла ошибка'}</p>
        <a href="/orders" class="btn btn-primary">Вернуться к заказам</a>
      </div>
    `;
  }
}

/**
 * Получить цвет статуса заказа
 */
function getStatusColor(status) {
  if (!status) return '#64748b';
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
  if (!status) return '❓ Неизвестен';
  const labels = {
    'pending': '⏳ Ожидает обработки',
    'processing': '⚙️ В обработке',
    'shipped': '📦 Отправлен',
    'delivered': '✓ Доставлен',
    'cancelled': '✗ Отменён'
  };
  return labels[status] || status;
}

/**
 * Рендер селектора статуса для администратора
 */
function renderAdminStatusSelector() {
  // Доступные переходы из текущего статуса
  const validTransitions = {
    'pending': [
      { value: 'processing', label: '⚙️ В обработке' },
      { value: 'cancelled', label: '✗ Отменён' }
    ],
    'processing': [
      { value: 'shipped', label: '📦 Отправлен' },
      { value: 'cancelled', label: '✗ Отменён' }
    ],
    'shipped': [
      { value: 'delivered', label: '✓ Доставлен' }
    ],
    'delivered': [],
    'cancelled': []
  };

  const availableTransitions = validTransitions[currentOrder.status] || [];

  if (availableTransitions.length === 0) {
    return `
      <div id="admin-status-panel" style="background: #f0fdf4; padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 2rem; border: 2px solid #10b981;">
        <h3 style="margin: 0; color: var(--text-primary); font-size: 1.125rem;">
          ✅ Заказ в конечном статусе
        </h3>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: var(--text-secondary);">
          💡 Из этого статуса невозможно изменить статус
        </p>
      </div>
    `;
  }

  return `
    <!-- Панель управления статусом (только для администраторов) -->
    <div id="admin-status-panel" style="background: #f0f9ff; padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 2rem; border: 2px solid #3b82f6;">
      <h3 style="margin: 0 0 1rem 0; color: var(--text-primary); font-size: 1.125rem;">
        🔧 Управление статусом заказа
      </h3>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <label for="admin-status-select" style="font-weight: 500; color: var(--text-primary);">
          Новый статус:
        </label>
        <select id="admin-status-select" class="form-input" style="flex: 1; max-width: 300px;">
          <option value="">— Выберите статус —</option>
          ${availableTransitions.map(opt => `
            <option value="${opt.value}">
              ${opt.label}
            </option>
          `).join('')}
        </select>
      </div>
      <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: var(--text-secondary);">
        💡 Текущий статус: ${getStatusLabel(currentOrder.status)}
      </p>
    </div>
  `;
}

/**
 * Обработчик изменения статуса заказа
 */
async function handleStatusChange(event) {
  const newStatus = event.target.value;

  if (!newStatus) {
    return;
  }

  if (!confirm(`Изменить статус заказа на "${getStatusLabel(newStatus)}"?`)) {
    event.target.value = '';
    return;
  }

  try {
    const response = await API.request(`/orders/${currentOrder._id}/status`, {
      method: 'PUT',
      body: { status: newStatus }
    });

    if (response.success) {
      UI.showAlert('✓ Статус заказа обновлён', 'success');

      // Обновляем текущий заказ
      currentOrder = response.data;

      // Обновляем бейдж статуса
      const badge = document.getElementById('order-status-badge');
      badge.style.backgroundColor = getStatusColor(currentOrder.status);
      badge.textContent = getStatusLabel(currentOrder.status);

      // Обновляем бордюр карточки
      const card = badge.closest('div[style*="border-left"]');
      card.style.borderLeftColor = getStatusColor(currentOrder.status);

      // Перезагружаем страницу для обновления селектора
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  } catch (error) {
    UI.showAlert('Ошибка обновления статуса: ' + (error.message || 'неизвестная ошибка'), 'danger');
    event.target.value = '';
  }
}
