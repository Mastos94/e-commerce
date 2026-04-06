/**
 * Products Page Initialization
 * Loads products with filters on the products page
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Страница товаров: DOM загружен, начинаем загрузку товаров...');
  
  // Привязываем обработчик к кнопке "Применить фильтры"
  const applyFiltersBtn = document.getElementById('apply-filters-btn');
  if (applyFiltersBtn) {
    console.log('Кнопка фильтров найдена, привязываем обработчик');
    applyFiltersBtn.addEventListener('click', () => {
      console.log('Применяем фильтры...');
      loadProducts(1);
    });
  }
  
  if (typeof loadProducts === 'function') {
    loadProducts(1);
  } else {
    console.error('Функция loadProducts не найдена!');
  }
});
