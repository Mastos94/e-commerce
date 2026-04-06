/**
 * Database Seed Script
 * Populates the database with sample data for testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const { mongodb } = require('../config/database');

// Sample products data
const sampleProducts = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling headphones with 30-hour battery life and superior sound quality',
    price: 79.99,
    category: 'Electronics',
    stock: 50,
    images: ['/images/headphones.jpg']
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB backlit mechanical keyboard with Cherry MX switches and programmable macros',
    price: 129.99,
    category: 'Electronics',
    stock: 30,
    images: ['/images/keyboard.jpg']
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'Adjustable office chair with lumbar support and breathable mesh back',
    price: 249.99,
    category: 'Home',
    stock: 20,
    images: ['/images/chair.jpg']
  },
  {
    name: '27-inch 4K Monitor',
    description: 'Ultra HD IPS monitor with HDR support and USB-C connectivity',
    price: 399.99,
    category: 'Electronics',
    stock: 15,
    images: ['/images/monitor.jpg']
  },
  {
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking and long battery life',
    price: 39.99,
    category: 'Electronics',
    stock: 100,
    images: ['/images/mouse.jpg']
  },
  {
    name: 'Programming Book Collection',
    description: 'Complete set of modern programming books covering JavaScript, Python, and System Design',
    price: 89.99,
    category: 'Books',
    stock: 25,
    images: ['/images/books.jpg']
  },
  {
    name: 'Cotton T-Shirt',
    description: 'Comfortable 100% cotton t-shirt available in multiple colors',
    price: 19.99,
    category: 'Clothing',
    stock: 200,
    images: ['/images/tshirt.jpg']
  },
  {
    name: 'Denim Jeans',
    description: 'Classic fit denim jeans with stretch comfort',
    price: 49.99,
    category: 'Clothing',
    stock: 75,
    images: ['/images/jeans.jpg']
  },
  {
    name: 'Smart Watch',
    description: 'Fitness tracking smartwatch with heart rate monitor and GPS',
    price: 199.99,
    category: 'Electronics',
    stock: 40,
    images: ['/images/watch.jpg']
  },
  {
    name: 'Desk Lamp',
    description: 'LED desk lamp with adjustable brightness and color temperature',
    price: 34.99,
    category: 'Home',
    stock: 60,
    images: ['/images/lamp.jpg']
  },
  {
    name: 'Backpack',
    description: 'Durable laptop backpack with multiple compartments and water-resistant material',
    price: 59.99,
    category: 'Clothing',
    stock: 45,
    images: ['/images/backpack.jpg']
  },
  {
    name: 'Portable Charger',
    description: '20000mAh portable power bank with fast charging support',
    price: 29.99,
    category: 'Electronics',
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
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create sample users
    console.log('Creating sample users...');
    
    const adminUser = await User.create({
      email: 'admin@synergy.com',
      password: 'Admin123456',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    const testUser = await User.create({
      email: 'user@synergy.com',
      password: 'User123456',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user'
    });

    console.log('✓ Created sample users');
    console.log(`  - Admin: ${adminUser.email} / Admin123456`);
    console.log(`  - User: ${testUser.email} / User123456`);

    // Create sample products
    console.log('Creating sample products...');
    const products = await Product.insertMany(sampleProducts);
    console.log(`✓ Created ${products.length} products`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nYou can now:');
    console.log('  1. Login as admin: admin@synergy.com / Admin123456');
    console.log('  2. Login as user: user@synergy.com / User123456');
    console.log('  3. Browse products');
    console.log('  4. Add items to cart');
    console.log('  5. Create orders\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed
seed();
