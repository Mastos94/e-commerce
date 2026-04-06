/**
 * Database Seed Script
 * Populates the database with sample data for testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const { mongodb } = require('../config/database');

// Sample products data
const sampleProducts = [
  {
    name: 'Беспроводные Bluetooth наушники',
    description: 'Премиальные наушники с шумоподавлением, 30 часов работы и превосходное качество звука',
    price: 79.99,
    category: 'Электроника',
    stock: 50,
    images: ['/images/headphones.jpg']
  },
  {
    name: 'Механическая игровая клавиатура',
    description: 'Механическая клавиатура с RGB подсветкой, переключателями Cherry MX и программируемыми макросами',
    price: 129.99,
    category: 'Электроника',
    stock: 30,
    images: ['/images/keyboard.jpg']
  },
  {
    name: 'Эргономичное офисное кресло',
    description: 'Регулируемое офисное кресло с поддержкой поясницы и дышащей сетчатой спинкой',
    price: 249.99,
    category: 'Дом',
    stock: 20,
    images: ['/images/chair.jpg']
  },
  {
    name: '27-дюймовый 4K монитор',
    description: 'Ultra HD IPS монитор с поддержкой HDR и подключением через USB-C',
    price: 399.99,
    category: 'Электроника',
    stock: 15,
    images: ['/images/monitor.jpg']
  },
  {
    name: 'Беспроводная мышь',
    description: 'Эргономичная беспроводная мышь с точным отслеживанием и долгим временем работы от батареи',
    price: 39.99,
    category: 'Электроника',
    stock: 100,
    images: ['/images/mouse.jpg']
  },
  {
    name: 'Коллекция книг по программированию',
    description: 'Полный набор современных книг по программированию: JavaScript, Python и системный дизайн',
    price: 89.99,
    category: 'Книги',
    stock: 25,
    images: ['/images/books.jpg']
  },
  {
    name: 'Хлопковая футболка',
    description: 'Удобная футболка из 100% хлопка, доступна в нескольких цветах',
    price: 19.99,
    category: 'Одежда',
    stock: 200,
    images: ['/images/tshirt.jpg']
  },
  {
    name: 'Джинсы',
    description: 'Джинсы классического кроя с эффектом стрейч',
    price: 49.99,
    category: 'Одежда',
    stock: 75,
    images: ['/images/jeans.jpg']
  },
  {
    name: 'Смарт-часы',
    description: 'Фитнес-трекер с мониторингом сердечного ритма и GPS',
    price: 199.99,
    category: 'Электроника',
    stock: 40,
    images: ['/images/watch.jpg']
  },
  {
    name: 'Настольная лампа',
    description: 'Светодиодная настольная лампа с регулируемой яркостью и цветовой температурой',
    price: 34.99,
    category: 'Дом',
    stock: 60,
    images: ['/images/lamp.jpg']
  },
  {
    name: 'Рюкзак',
    description: 'Прочный рюкзак для ноутбука с несколькими отделениями и водостойким материалом',
    price: 59.99,
    category: 'Одежда',
    stock: 45,
    images: ['/images/backpack.jpg']
  },
  {
    name: 'Портативное зарядное устройство',
    description: 'Портативный аккумулятор 20000 мАч с поддержкой быстрой зарядки',
    price: 29.99,
    category: 'Электроника',
    stock: 80,
    images: ['/images/charger.jpg']
  }
];

/**
 * Seed the database with sample data
 */
async function seed() {
  try {
    // Connect to database
    await mongoose.connect(mongodb.uri, mongodb.options);
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    console.log('Очистка существующих данных...');
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('✓ Данные очищены');

    // Create sample users
    console.log('Создание тестовых пользователей...');

    const adminUser = await User.create({
      email: 'admin@synergy.com',
      password: 'Admin123456',
      firstName: 'Админ',
      lastName: 'Пользователь',
      role: 'admin'
    });

    const testUser = await User.create({
      email: 'user@synergy.com',
      password: 'User123456',
      firstName: 'Иван',
      lastName: 'Иванов',
      role: 'user'
    });

    console.log('✓ Тестовые пользователи созданы');
    console.log(`  - Админ: ${adminUser.email} / Admin123456`);
    console.log(`  - Пользователь: ${testUser.email} / User123456`);

    // Create sample products
    console.log('Создание тестовых товаров...');
    const products = await Product.insertMany(sampleProducts);
    console.log(`✓ Создано товаров: ${products.length}`);

    // Create sample orders for testing
    console.log('Создание тестовых заказов...');

    // Order 1 - pending
    const order1 = await Order.create({
      userId: testUser._id,
      totalAmount: 159.98,
      shippingAddress: 'г. Москва, ул. Ленина, д. 15, кв. 42',
      status: 'pending'
    });

    await OrderItem.insertMany([
      {
        orderId: order1._id,
        productId: products[0]._id, // наушники
        quantity: 2,
        price: 79.99,
        subtotal: 159.98
      }
    ]);

    // Order 2 - processing
    const order2 = await Order.create({
      userId: testUser._id,
      totalAmount: 439.97,
      shippingAddress: 'г. Санкт-Петербург, Невский проспект, д. 28',
      status: 'processing'
    });

    await OrderItem.insertMany([
      {
        orderId: order2._id,
        productId: products[2]._id, // кресло
        quantity: 1,
        price: 249.99,
        subtotal: 249.99
      },
      {
        orderId: order2._id,
        productId: products[8]._id, // смарт-часы
        quantity: 1,
        price: 199.99,
        subtotal: 199.99
      }
    ]);

    // Order 3 - shipped
    const order3 = await Order.create({
      userId: testUser._id,
      totalAmount: 169.97,
      shippingAddress: 'г. Казань, ул. Баумана, д. 5, кв. 10',
      status: 'shipped'
    });

    await OrderItem.insertMany([
      {
        orderId: order3._id,
        productId: products[1]._id, // клавиатура
        quantity: 1,
        price: 129.99,
        subtotal: 129.99
      },
      {
        orderId: order3._id,
        productId: products[4]._id, // мышь
        quantity: 1,
        price: 39.99,
        subtotal: 39.99
      }
    ]);

    console.log('✓ Создано тестовых заказов: 3');
    console.log('  - Заказ 1: Ожидает (159.98 ₽)');
    console.log('  - Заказ 2: В обработке (439.97 ₽)');
    console.log('  - Заказ 3: Отправлен (169.97 ₽)');

    console.log('\n✅ База данных успешно заполнена!');
    console.log('\nТеперь вы можете:');
    console.log('  1. Войти как админ: admin@synergy.com / Admin123456');
    console.log('  2. Войти как пользователь: user@synergy.com / User123456');
    console.log('  3. Просматривать товары');
    console.log('  4. Добавлять товары в корзину');
    console.log('  5. Создавать заказы');
    console.log('  6. Управлять статусами заказов (админ)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed
seed();
