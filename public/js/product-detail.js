/**
 * Product Detail Page
 * Displays product information and allows adding to cart
 */

async function loadProductDetail() {
  const container = document.getElementById('product-detail-container');
  
  // Extract product ID from URL
  const pathParts = window.location.pathname.split('/');
  const productId = pathParts[pathParts.length - 1];

  if (!productId) {
    container.innerHTML = '<p class="text-center" style="padding: 3rem; color: #ef4444;">Товар не найден</p>';
    return;
  }

  UI.showLoading('product-detail-container');

  try {
    const response = await API.getProduct(productId);

    if (!response.success || !response.data) {
      container.innerHTML = '<p class="text-center" style="padding: 3rem; color: #ef4444;">Товар не найден</p>';
      return;
    }

    const product = response.data.data;

    container.innerHTML = `
      <div class="product-detail">
        <a href="/products" class="back-link">← Назад к товарам</a>
        
        <div class="product-detail-grid">
          <div class="product-detail-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 6rem;">
            📦
          </div>
          
          <div class="product-detail-info">
            <h1 class="product-detail-name">${product.name}</h1>
            
            <div class="product-detail-price">${UI.formatCurrency(product.price)}</div>
            
            <div class="product-detail-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
              ${product.stock > 0 ? `✓ В наличии (${product.stock} шт.)` : '✗ Нет в наличии'}
            </div>
            
            <div class="product-detail-description">
              ${product.description}
            </div>
            
            <button class="btn btn-primary btn-lg add-to-cart-detail-btn" 
                    data-product-id="${product._id}"
                    ${product.stock === 0 ? 'disabled' : ''}>
              🛒 Добавить в корзину
            </button>
          </div>
        </div>
      </div>
    `;

    // Add event listener to "Add to Cart" button
    const addToCartBtn = container.querySelector('.add-to-cart-detail-btn');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', function() {
        const productId = this.getAttribute('data-product-id');
        if (productId) {
          window.addToCart(productId);
        }
      });
    }

  } catch (error) {
    console.error('Ошибка загрузки товара:', error);
    container.innerHTML = '<p class="text-center" style="padding: 3rem; color: #ef4444;">Ошибка загрузки товара</p>';
    UI.showAlert('Не удалось загрузить товар: ' + error.message, 'danger');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
  loadProductDetail();
});
