/**
 * Checkout Page Initialization
 */

function handleCheckout(event) {
  event.preventDefault();

  if (!API.isAuthenticated()) {
    UI.showAlert('Пожалуйста, войдите в систему для оформления заказа', 'warning');
    return;
  }

  const shippingAddress = document.getElementById('shippingAddress')?.value;

  if (!shippingAddress || shippingAddress.length < 10) {
    UI.showAlert('Пожалуйста, введите корректный адрес доставки', 'warning');
    return;
  }

  API.createOrder(shippingAddress)
    .then(response => {
      if (response.success) {
        UI.showAlert('Заказ успешно оформлен!', 'success');
        setTimeout(() => {
          window.location.href = `/orders/${response.data._id}`;
        }, 1500);
      }
    })
    .catch(error => {
      UI.showAlert(error.message || 'Ошибка оформления заказа', 'danger');
    });
}
