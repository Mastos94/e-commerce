/**
 * Login Page Initialization
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Страница входа: DOM загружен');
  
  // Проверяем, есть ли уже токен
  if (API.isAuthenticated()) {
    console.log('Пользователь уже аутентифицирован, перенаправляем на главную');
    window.location.href = '/';
    return;
  }
  
  // Привязываем обработчик к форме
  const loginForm = document.querySelector('form');
  if (loginForm) {
    console.log('Форма найдена, привязываем обработчик');
    loginForm.addEventListener('submit', handleLogin);
  } else {
    console.error('Форма входа не найдена!');
  }
});

function handleLogin(event) {
  event.preventDefault();
  console.log('handleLogin вызвана');

  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;
  
  console.log('Попытка входа с email:', email);

  if (!email || !password) {
    UI.showAlert('Пожалуйста, заполните все поля', 'warning');
    return;
  }

  console.log('Вызываем API.login...');
  
  API.login(email, password)
    .then(response => {
      console.log('Ответ от API.login:', response);
      
      if (response.success) {
        console.log('Вход успешен, токен сохранен');
        UI.showAlert('Вход выполнен успешно!', 'success');
        
        // Проверяем, что токен действительно сохранен
        console.log('Токен после входа:', API.getToken() ? 'присутствует' : 'отсутствует');
        console.log('Пользователь:', API.getUser());
        
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    })
    .catch(error => {
      console.error('Ошибка входа:', error);
      UI.showAlert('Ошибка входа: ' + (error.message || 'неизвестная ошибка'), 'danger');
    });
}
