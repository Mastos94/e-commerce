/**
 * Main Application Module
 * Handles UI interactions and page initialization
 */

const UI = {
  /**
   * Show alert message
   * @param {string} message - Alert message
   * @param {string} type - Alert type (success, danger, warning, info)
   */
  showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    alertContainer.appendChild(alert);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      alert.remove();
    }, 5000);
  },

  /**
   * Show loading state
   * @param {string} elementId - Element ID to show loading
   */
  showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = '<div class="spinner"></div>';
    }
  },

  /**
   * Hide loading state
   * @param {string} elementId - Element ID to hide loading
   */
  hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = '';
    }
  },

  /**
   * Format currency
   * @param {number} amount - Amount
   * @returns {string}
   */
  formatCurrency(amount) {
    return `${amount.toFixed(2)} ₽`;
  },

  /**
   * Format date
   * @param {string} dateString - Date string
   * @returns {string}
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  /**
   * Get status badge class
   * @param {string} status - Order status
   * @returns {string}
   */
  getStatusBadgeClass(status) {
    return `badge badge-${status}`;
  }
};

// Export as global
window.UI = UI;

// ==========================================
// Product Page Handler
// ==========================================

async function loadProducts(page = 1) {
  console.log('loadProducts вызвана с page =', page);
  
  const container = document.getElementById('products-container');
  console.log('Контейнер товаров:', container);
  
  if (!container) {
    console.error('Контейнер products-container не найден!');
    return;
  }

  UI.showLoading('products-container');

  try {
    // Получаем значения фильтров
    const category = document.getElementById('filter-category')?.value || '';
    const search = document.getElementById('filter-search')?.value || '';
    const sort = document.getElementById('filter-sort')?.value || '';

    const params = {
      page,
      limit: 12
    };

    if (category) params.category = category;
    if (search) params.search = search;
    if (sort) {
      const [field, order] = sort.split('-');
      params.sort = field;
      params.order = order;
    }

    console.log('Запрос API с параметрами:', params);
    const response = await API.getProducts(params);
    console.log('Ответ API:', response);

    const products = response.data?.data || [];

    if (response.success && products.length > 0) {
      console.log('Найдено товаров:', products.length);

      container.innerHTML = products.map(product => `
        <div class="product-card">
          <div class="product-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">📦</div>
          <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-description">${product.description}</div>
            <div class="product-price">${UI.formatCurrency(product.price)}</div>
            <div class="product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
              ${product.stock > 0 ? `✓ В наличии (${product.stock} шт.)` : '✗ Нет в наличии'}
            </div>
            <button class="btn btn-primary btn-sm add-to-cart-btn" 
                    data-product-id="${product._id}"
                    ${product.stock === 0 ? 'disabled' : ''}>
              🛒 В корзину
            </button>
          </div>
        </div>
      `).join('');

      // Рендерим пагинацию
      renderPagination(response.data.pagination, page);
    } else {
      console.warn('Товары не найдены');
      container.innerHTML = '<p class="text-center" style="grid-column: 1/-1; padding: 3rem; color: #64748b;">Товары не найдены</p>';
    }
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error);
    container.innerHTML = '<p class="text-center" style="grid-column: 1/-1; padding: 3rem; color: #ef4444;">Ошибка загрузки товаров. Проверьте консоль (F12)</p>';
    UI.showAlert('Не удалось загрузить товары: ' + error.message, 'danger');
  }
}

function renderPagination(pagination, currentPage) {
  const paginationContainer = document.getElementById('pagination');
  if (!paginationContainer || pagination.totalPages <= 1) {
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }

  let paginationHTML = '';

  // Кнопка "Назад"
  paginationHTML += `
    <button class="pagination-btn" 
            data-page="${currentPage - 1}"
            ${currentPage === 1 ? 'disabled' : ''}>
      ← Назад
    </button>
  `;

  // Номера страниц
  for (let i = 1; i <= pagination.totalPages; i++) {
    if (i === currentPage) {
      paginationHTML += `<button class="pagination-btn active" data-page="${i}">${i}</button>`;
    } else {
      paginationHTML += `<button class="pagination-btn" data-page="${i}">${i}</button>`;
    }
  }

  // Кнопка "Вперед"
  paginationHTML += `
    <button class="pagination-btn" 
            data-page="${currentPage + 1}"
            ${currentPage === pagination.totalPages ? 'disabled' : ''}>
      Вперед →
    </button>
  `;

  paginationContainer.innerHTML = paginationHTML;
  
  // Привязываем обработчики к кнопкам пагинации через делегирование
  paginationContainer.onclick = function(event) {
    if (event.target.classList.contains('pagination-btn') && !event.target.disabled) {
      const page = parseInt(event.target.getAttribute('data-page'));
      if (page) {
        loadProducts(page);
      }
    }
  };
}

// ==========================================
// Utility Functions
// ==========================================

function handleLogout() {
  console.log('Выход из системы...');
  API.logout();
  window.location.href = '/login';
}

// ==========================================
// Initialize on page load
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('main.js: DOM загружен');

  // Handle invalid token scenario - clear stale tokens
  if (API.isAuthenticated()) {
    const token = API.getToken();
    // Check if token looks valid (JWT tokens should have 3 parts separated by dots)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.warn('Обнаружен недействительный токен, очищаем хранилище');
      API.removeToken();
      window.location.reload();
      return;
    }
  }

  // Initialize cart
  Cart.init();

  // Делегирование событий для кнопок "В корзину"
  document.addEventListener('click', function(event) {
    // Проверяем, была ли нажата кнопка "В корзину"
    const addToCartBtn = event.target.closest('.add-to-cart-btn');
    if (addToCartBtn) {
      console.log('Делегирование: кнопка "В корзину" нажата');
      const productId = addToCartBtn.getAttribute('data-product-id');
      console.log('Product ID из data-атрибута:', productId);
      
      if (productId) {
        window.addToCart(productId);
      } else {
        console.error('Product ID не найден!');
      }
      return;
    }
  });

  // Update navigation based on auth state
  const authLinks = document.getElementById('auth-links');
  const userLinks = document.getElementById('user-links');

  if (API.isAuthenticated()) {
    if (authLinks) authLinks.style.display = 'none';
    if (userLinks) userLinks.style.display = 'flex';
    
    // Привязываем обработчик к кнопке выхода
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      console.log('Кнопка выхода найдена, привязываем обработчик');
      logoutBtn.addEventListener('click', handleLogout);
    }
  } else {
    if (authLinks) authLinks.style.display = 'flex';
    if (userLinks) userLinks.style.display = 'none';
  }
});
