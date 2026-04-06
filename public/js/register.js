/**
 * Register Page Initialization
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Страница регистрации: DOM загружен');
  
  // Привязываем обработчик к форме
  const registerForm = document.querySelector('form');
  if (registerForm) {
    console.log('Форма регистрации найдена, привязываем обработчик');
    registerForm.addEventListener('submit', handleRegister);
  } else {
    console.error('Форма регистрации не найдена!');
  }
});

function handleRegister(event) {
  event.preventDefault();
  console.log('handleRegister вызвана');

  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;
  const firstName = document.getElementById('firstName')?.value;
  const lastName = document.getElementById('lastName')?.value;

  console.log('Попытка регистрации с email:', email);

  if (!email || !password || !firstName || !lastName) {
    UI.showAlert('Пожалуйста, заполните все поля', 'warning');
    return;
  }

  if (password.length < 8) {
    UI.showAlert('Пароль должен содержать минимум 8 символов', 'warning');
    return;
  }

  console.log('Вызываем API.register...');
  
  API.register({ email, password, firstName, lastName })
    .then(response => {
      console.log('Ответ от API.register:', response);
      
      if (response.success) {
        console.log('Регистрация успешна, токен сохранен');
        UI.showAlert('Регистрация прошла успешно!', 'success');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    })
    .catch(error => {
      console.error('Ошибка регистрации:', error);
      UI.showAlert('Ошибка регистрации: ' + (error.message || 'неизвестная ошибка'), 'danger');
    });
}
