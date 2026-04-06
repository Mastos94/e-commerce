# Synergy E-Commerce - Quick Start Guide

## Project Overview
This is a complete e-commerce web application developed as part of Laboratory Work #1-4 for collaborative web development training.

## Features Implemented
✅ User registration and authentication with JWT
✅ Product catalog with search, filter, and pagination
✅ Shopping cart management
✅ Order processing with transaction support
✅ Role-based access control (User/Admin)
✅ Responsive web design
✅ RESTful API with JSON data exchange
✅ Input validation and security measures
✅ Automated testing (unit + integration)
✅ MVC architecture with Repository pattern

## Technology Stack
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Template Engine**: EJS
- **Testing**: Jest + Supertest
- **Security**: Helmet, bcrypt, JWT

## Quick Start

### Prerequisites
- Node.js (version 18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and update the following:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (a secure random string)
# - SESSION_SECRET (a secure random string)
```

3. **Seed Database with Sample Data**
```bash
npm run db:seed
```

This creates:
- Admin user: `admin@synergy.com` / `Admin123456`
- Regular user: `user@synergy.com` / `User123456`
- 12 sample products across different categories

4. **Start Development Server**
```bash
npm run dev
```

The application will start at: `http://localhost:3000`
API available at: `http://localhost:3000/api/v1`

## Available Scripts

```bash
# Development
npm run dev          # Start with auto-reload (nodemon)
npm start            # Start production server

# Database
npm run db:seed      # Seed database with sample data

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Code Quality
npm run lint         # Check code style
npm run lint:fix     # Fix code style issues
```

## Project Structure

```
synergy/
├── src/                      # Backend source
│   ├── app.js                # Application entry point
│   ├── config/               # Configuration files
│   ├── controllers/          # Request handlers
│   ├── middleware/           # Custom middleware
│   ├── models/               # Mongoose schemas
│   ├── repositories/         # Data access layer
│   ├── routes/               # Route definitions
│   ├── services/             # Business logic
│   └── scripts/              # Database scripts
├── public/                   # Static files
│   ├── css/                  # Stylesheets
│   └── js/                   # Client-side JavaScript
├── views/                    # EJS templates
│   ├── layouts/              # Layout templates
│   └── pages/                # Page templates
├── tests/                    # Test files
│   ├── unit/                 # Unit tests
│   └── integration/          # Integration tests
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md       # Architecture design
│   ├── DATABASE_SCHEMA.md    # Database design
│   ├── API_DOCUMENTATION.md  # API reference
│   └── REPORT.md             # Laboratory report
├── package.json              # Dependencies
└── README.md                 # Project overview
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Products (Public)
- `GET /api/v1/products` - List products with filters
- `GET /api/v1/products/:id` - Get product details

### Cart (Authenticated)
- `GET /api/v1/cart` - Get user's cart
- `POST /api/v1/cart/items` - Add item to cart
- `PUT /api/v1/cart/items/:itemId` - Update item quantity
- `DELETE /api/v1/cart/items/:itemId` - Remove item
- `DELETE /api/v1/cart` - Clear cart

### Orders (Authenticated)
- `POST /api/v1/orders` - Create order from cart
- `GET /api/v1/orders` - Get user's orders
- `GET /api/v1/orders/:id` - Get order details

### Admin Only
- `POST /api/v1/products` - Create product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product
- `PUT /api/v1/orders/:id/status` - Update order status
- `GET /api/v1/orders/admin/all` - Get all orders

## Testing the Application

### Manual Testing Flow

1. **Browse Products** (no login required)
   - Visit `http://localhost:3000/products`
   - Try search and filter functionality
   - View product details

2. **Register Account**
   - Visit `http://localhost:3000/register`
   - Fill in registration form
   - You'll be automatically logged in

3. **Add to Cart**
   - Browse products and click "Add to Cart"
   - Visit cart to see items
   - Update quantities or remove items

4. **Place Order**
   - Go to cart
   - Click "Proceed to Checkout"
   - Enter shipping address
   - Order will be created

5. **View Orders**
   - Visit "My Orders" in navigation
   - View order details and status

6. **Admin Features** (login as admin)
   - Login with `admin@synergy.com` / `Admin123456`
   - Create/edit/delete products
   - View all orders
   - Update order status

### Running Automated Tests

```bash
# Run all tests
npm test

# View test coverage
npm run test:coverage
# Open coverage/lcov-report/index.html in browser
```

## Security Features

✅ **Authentication**: JWT tokens for session management
✅ **Password Security**: bcrypt hashing (10 salt rounds)
✅ **Input Validation**: express-validator on all endpoints
✅ **SQL Injection Prevention**: MongoDB + Mongoose ODM
✅ **XSS Protection**: Helmet.js security headers
✅ **CSRF Protection**: Token-based protection
✅ **Rate Limiting**: Prevents abuse
✅ **CORS Configuration**: Controlled cross-origin access
✅ **No Hardcoded Secrets**: Environment variables only

## Architecture Patterns

### MVC (Model-View-Controller)
- **Models**: Mongoose schemas in `src/models/`
- **Views**: EJS templates in `views/`
- **Controllers**: Request handlers in `src/controllers/`

### Repository Pattern
- Data access abstraction in `src/repositories/`
- Controllers don't access database directly
- Easy to test and swap data sources

### Service Layer
- Business logic in `src/services/`
- Complex operations (e.g., order creation with transactions)
- Transaction management

## Database Schema

### Collections
- **Users**: User accounts with hashed passwords
- **Products**: Product catalog with search indexes
- **Orders**: Customer orders with status tracking
- **OrderItems**: Individual line items in orders
- **ShoppingCarts**: User shopping carts

See `docs/DATABASE_SCHEMA.md` for detailed ER diagram and schema definitions.

## Development Team Roles

For a 2-3 person team:

### Backend Developer
- Database models and schemas
- Repository implementations
- Service layer logic
- API controllers
- Unit tests

### Frontend Developer
- UI/UX design
- CSS styling
- Client-side JavaScript
- EJS templates
- AJAX API client

### Full-Stack/DevOps (if 3 members)
- Project configuration
- Middleware setup
- Security measures
- Test infrastructure
- Documentation

## Documentation

All documentation is available in the `docs/` folder:

- **ARCHITECTURE.md**: System architecture and design
- **DATABASE_SCHEMA.md**: Database structure and relationships
- **API_DOCUMENTATION.md**: Complete API reference
- **REPORT.md**: Comprehensive laboratory report (30-40 pages)

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
# Windows: Check Services or run MongoDB manually
# Make sure MONGODB_URI in .env is correct
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

### Tests Failing
```bash
# Make sure you have installed all dependencies
npm install

# Clear Jest cache
npm test -- --clearCache
```

## Next Steps

To extend this project:

1. **Add Payment Integration**: Stripe or PayPal
2. **Email Notifications**: Order confirmations
3. **Product Reviews**: User ratings system
4. **Admin Dashboard**: Analytics interface
5. **Image Upload**: Product image management
6. **Docker Support**: Containerization
7. **CI/CD Pipeline**: Automated testing and deployment

## Support

For questions or issues:
- Check documentation in `docs/` folder
- Review test files for usage examples
- Check API documentation for endpoint details

## License

MIT License - Educational use permitted

---

**Laboratory Work #1-4 Complete!** ✅

All requirements met:
- ✅ MVC architecture
- ✅ Repository pattern
- ✅ Async operations
- ✅ Team collaboration setup
- ✅ Automated testing
- ✅ Security measures
- ✅ Code quality
- ✅ Comprehensive documentation
