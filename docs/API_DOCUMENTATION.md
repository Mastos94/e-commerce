# API Documentation - JSON Data Exchange Formats

## Base URL
```
http://localhost:3000/api/v1
```

## Response Format
All API responses follow this structure:
```json
{
  "success": true/false,
  "data": { ... },
  "message": "Human-readable message",
  "error": "Error details (if success is false)"
}
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "createdAt": "2026-04-06T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Registration successful"
}
```

### POST /auth/login
Authenticate user and return JWT token

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

---

## Product Endpoints

### GET /products
Get all products with optional filtering and pagination

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `category` (string): Filter by category
- `search` (string): Search in name and description
- `sort` (string): Sort field (price, name, createdAt)
- `order` (string): Sort order (asc, desc)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Wireless Headphones",
        "description": "High-quality Bluetooth headphones",
        "price": 79.99,
        "category": "Electronics",
        "stock": 50,
        "images": ["/images/product1.jpg"],
        "createdAt": "2026-04-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  },
  "message": "Products retrieved successfully"
}
```

### GET /products/:id
Get single product details

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Wireless Headphones",
    "description": "High-quality Bluetooth headphones",
    "price": 79.99,
    "category": "Electronics",
    "stock": 50,
    "images": ["/images/product1.jpg"],
    "createdAt": "2026-04-01T10:00:00.000Z",
    "updatedAt": "2026-04-05T15:30:00.000Z"
  },
  "message": "Product retrieved successfully"
}
```

### POST /products (Admin only)
Create new product

**Request Body:**
```json
{
  "name": "Wireless Headphones",
  "description": "High-quality Bluetooth headphones",
  "price": 79.99,
  "category": "Electronics",
  "stock": 50,
  "images": ["/images/product1.jpg"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Wireless Headphones",
    "description": "High-quality Bluetooth headphones",
    "price": 79.99,
    "category": "Electronics",
    "stock": 50,
    "images": ["/images/product1.jpg"],
    "createdAt": "2026-04-06T10:00:00.000Z"
  },
  "message": "Product created successfully"
}
```

---

## Cart Endpoints

### GET /cart
Get current user's shopping cart

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "items": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "productId": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Wireless Headphones",
          "price": 79.99,
          "images": ["/images/product1.jpg"]
        },
        "quantity": 2,
        "price": 79.99,
        "subtotal": 159.98
      }
    ],
    "totalItems": 2,
    "totalAmount": 159.98,
    "updatedAt": "2026-04-06T10:30:00.000Z"
  },
  "message": "Cart retrieved successfully"
}
```

### POST /cart/items
Add item to cart

**Request Body:**
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 2
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "items": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "productId": "507f1f77bcf86cd799439011",
        "quantity": 2,
        "price": 79.99,
        "subtotal": 159.98
      }
    ],
    "totalItems": 2,
    "totalAmount": 159.98,
    "updatedAt": "2026-04-06T10:30:00.000Z"
  },
  "message": "Item added to cart successfully"
}
```

### PUT /cart/items/:itemId
Update cart item quantity

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "totalItems": 3,
    "totalAmount": 239.97
  },
  "message": "Cart updated successfully"
}
```

### DELETE /cart/items/:itemId
Remove item from cart

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "totalItems": 0,
    "totalAmount": 0
  },
  "message": "Item removed from cart"
}
```

---

## Order Endpoints

### POST /orders
Create order from cart

**Request Body:**
```json
{
  "shippingAddress": "123 Main St, City, Country"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "userId": "507f1f77bcf86cd799439011",
    "status": "pending",
    "totalAmount": 159.98,
    "shippingAddress": "123 Main St, City, Country",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "productName": "Wireless Headphones",
        "quantity": 2,
        "price": 79.99,
        "subtotal": 159.98
      }
    ],
    "createdAt": "2026-04-06T11:00:00.000Z"
  },
  "message": "Order created successfully"
}
```

### GET /orders
Get user's orders

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "userId": "507f1f77bcf86cd799439011",
        "status": "pending",
        "totalAmount": 159.98,
        "shippingAddress": "123 Main St, City, Country",
        "itemCount": 2,
        "createdAt": "2026-04-06T11:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10
    }
  },
  "message": "Orders retrieved successfully"
}
```

### GET /orders/:id
Get order details

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "userId": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "status": "pending",
    "totalAmount": 159.98,
    "shippingAddress": "123 Main St, City, Country",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "productName": "Wireless Headphones",
        "quantity": 2,
        "price": 79.99,
        "subtotal": 159.98
      }
    ],
    "createdAt": "2026-04-06T11:00:00.000Z",
    "updatedAt": "2026-04-06T11:00:00.000Z"
  },
  "message": "Order retrieved successfully"
}
```

### PUT /orders/:id/status (Admin only)
Update order status

**Request Body:**
```json
{
  "status": "processing"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "status": "processing",
    "updatedAt": "2026-04-06T12:00:00.000Z"
  },
  "message": "Order status updated successfully"
}
```

---

## Error Responses

### Validation Error (400 Bad Request)
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

### Authentication Error (401 Unauthorized)
```json
{
  "success": false,
  "error": {
    "message": "Authentication required"
  }
}
```

### Authorization Error (403 Forbidden)
```json
{
  "success": false,
  "error": {
    "message": "Insufficient permissions"
  }
}
```

### Not Found Error (404 Not Found)
```json
{
  "success": false,
  "error": {
    "message": "Resource not found"
  }
}
```

### Server Error (500 Internal Server Error)
```json
{
  "success": false,
  "error": {
    "message": "Internal server error"
  }
}
```
