/**
 * Home Page Initialization
 * Loads products on the home page
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Главная страница: DOM загружен, начинаем загрузку товаров...');
  
  if (typeof loadProducts === 'function') {
    loadProducts(1);
  } else {
    console.error('Функция loadProducts не найдена!');
  }
});
