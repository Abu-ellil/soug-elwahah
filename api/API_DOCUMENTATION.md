# Tawseela Grocery Delivery API - Comprehensive Documentation

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Customer Endpoints](#customer-endpoints)
3. [Driver Endpoints](#driver-endpoints)
4. [Store Endpoints](#store-endpoints)
5. [Order Endpoints](#order-endpoints)
6. [Payment Endpoints](#payment-endpoints)
7. [Admin Endpoints](#admin-endpoints)
8. [Security Features](#security-features)

## Authentication Endpoints

### Register New User
- **POST** `/api/v1/auth/register`
- **Description**: Register a new user with multi-role support
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "+201234567890",
  "password": "string",
  "coordinates": [longitude, latitude],
  "role": "customer|store|driver"
}
```
- **Response**: JWT token and user profile

### Login User
- **POST** `/api/v1/auth/login`
- **Description**: Login with email/phone and password
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "string",
  "phone": "string",
  "password": "string"
}
```

### Send Phone OTP
- **POST** `/api/v1/auth/send-otp`
- **Description**: Send OTP for phone verification
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "phoneNumber": "+201234567890"
}
```

### Verify Phone OTP
- **POST** `/api/v1/auth/verify-otp`
- **Description**: Verify OTP and authenticate user
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "phoneNumber": "+201234567890",
  "otp": "string"
}
```

### Refresh Token
- **POST** `/api/v1/auth/refresh-token`
- **Description**: Refresh JWT access token
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "refreshToken": "string"
}
```

### Get User Profile
- **GET** `/api/v1/auth/profile`
- **Description**: Get authenticated user profile
- **Headers**: `Authorization: Bearer <token>`

### Update Profile
- **PUT** `/api/v1/auth/profile`
- **Description**: Update user profile information
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Partial user profile updates

### Switch Active Role
- **PATCH** `/api/v1/auth/switch-role`
- **Description**: Switch between user roles (customer, driver, store)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "targetRole": "customer|driver|store"
}
```

## Customer Endpoints

### Get Nearby Stores
- **GET** `/api/v1/customer/stores/nearby`
- **Description**: Get stores near the user's location
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `coordinates`: "longitude,latitude"
  - `radius`: distance in meters (default: 10000)
  - `limit`: number of results (default: 20)
  - `page`: page number (default: 1)

### Search Products
- **GET** `/api/v1/customer/products/search`
- **Description**: Search for products across all stores
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `q`: search query
  - `category`: product category
  - `minPrice`: minimum price
  - `maxPrice`: maximum price
  - `sortBy`: relevance|price-low|price-high|rating|newest
  - `limit`: number of results (default: 20)
  - `page`: page number (default: 1)

### Create Order
- **POST** `/api/v1/customer/orders`
- **Description**: Create a new order
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "items": [
    {
      "product": "product_id",
      "quantity": 1
    }
  ],
  "deliveryInfo": {
    "type": "pickup|delivery|shipping",
    "address": {
      "street": "string",
      "landmark": "string"
    },
    "coordinates": [longitude, latitude]
  },
  "payment": {
    "method": "cash|card|mobile_wallet|wallet",
    "status": "pending"
  },
  "notes": "string",
  "isUrgent": false,
  "isGift": false,
  "giftMessage": "string",
  "store": "store_id"
}
```

### Get Customer Orders
- **GET** `/api/v1/customer/orders`
- **Description**: Get customer's orders
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `status`: order status filter
  - `sortBy`: createdAt|newest|oldest|amount-high|amount-low
  - `limit`: number of results (default: 20)
  - `page`: page number (default: 1)

### Get Order Details
- **GET** `/api/v1/customer/orders/:id`
- **Description**: Get specific order details
- **Headers**: `Authorization: Bearer <token>`

### Cancel Order
- **PUT** `/api/v1/customer/orders/:id/cancel`
- **Description**: Cancel an order
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "reason": "string"
}
```

### Add to Favorites
- **POST** `/api/v1/customer/favorites`
- **Description**: Add product or store to favorites
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "productId": "string",
  "storeId": "string"
}
```

### Remove from Favorites
- **DELETE** `/api/v1/customer/favorites`
- **Description**: Remove from favorites
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `productId`: product ID
  - `storeId`: store ID

### Get Favorites
- **GET** `/api/v1/customer/favorites`
- **Description**: Get favorite items
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `type`: product|store
  - `limit`: number of results (default: 20)
  - `page`: page number (default: 1)

### Add Review
- **POST** `/api/v1/customer/reviews`
- **Description**: Add a review for store or driver
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "reviewee": "user_id|store_id",
  "rating": 1-5,
  "review": "string",
  "entityType": "store|driver"
}
```

### Get Store Reviews
- **GET** `/api/v1/customer/reviews/store/:storeId`
- **Description**: Get reviews for a specific store
- **Headers**: `Authorization: Bearer <token>`

### Get Driver Reviews
- **GET** `/api/v1/customer/reviews/driver/:driverId`
- **Description**: Get reviews for a specific driver
- **Headers**: `Authorization: Bearer <token>`

## Driver Endpoints

### Get Nearby Orders
- **GET** `/api/v1/drivers/orders/nearby`
- **Description**: Get orders near driver's location
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `coordinates`: "longitude,latitude"
  - `radius`: distance in meters (default: 1000)
  - `limit`: number of results (default: 20)
  - `page`: page number (default: 1)

### Bid on Order
- **POST** `/api/v1/drivers/orders/:orderId/bid`
- **Description**: Place a bid on an order
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "bidPrice": 50,
  "estimatedDeliveryTime": "30 minutes"
}
```

### Update Bid
- **PUT** `/api/v1/drivers/orders/:orderId/bid`
- **Description**: Update existing bid price
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "bidPrice": 45,
  "estimatedDeliveryTime": "25 minutes"
}
```

### Get Driver Orders
- **GET** `/api/v1/drivers/orders`
- **Description**: Get orders assigned to driver
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `status`: order status filter
  - `sortBy`: createdAt|newest|oldest|amount-high|amount-low
  - `limit`: number of results (default: 20)
  - `page`: page number (default: 1)

### Update Order Status
- **PUT** `/api/v1/drivers/orders/:orderId/status`
- **Description**: Update order status by driver
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "status": "out_for_delivery|delivered|cancelled"
}
```

### Get Driver Profile
- **GET** `/api/v1/drivers/profile`
- **Description**: Get driver's profile
- **Headers**: `Authorization: Bearer <token>`

### Update Driver Profile
- **PUT** `/api/v1/drivers/profile`
- **Description**: Update driver's profile
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "vehicleInfo": {
    "type": "car|bike|truck",
    "licensePlate": "string",
    "capacity": 100
  }
}
```

### Update Availability
- **PUT** `/api/v1/drivers/availability`
- **Description**: Update driver's availability status
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "isAvailable": true
}
```

### Get Earnings
- **GET** `/api/v1/drivers/earnings`
- **Description**: Get driver's earnings
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `period`: day|week|month
  - `startDate`: ISO date string
  - `endDate`: ISO date string

### Get Analytics
- **GET** `/api/v1/drivers/analytics`
- **Description**: Get driver's analytics
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `period`: day|week|month
  - `startDate`: ISO date string
  - `endDate`: ISO date string

### Accept Order Bid
- **POST** `/api/v1/drivers/orders/:orderId/accept`
- **Description**: Accept an order bid
- **Headers**: `Authorization: Bearer <token>`

### Get Bid History
- **GET** `/api/v1/drivers/bids`
- **Description**: Get driver's bid history
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `limit`: number of results (default: 20)
  - `page`: page number (default: 1)

## Store Endpoints

### Create Store
- **POST** `/api/v1/stores`
- **Description**: Create a new store
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "address": {
    "street": "string",
    "city": "string",
    "governorate": "string"
  },
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "contact": {
    "phone": "string",
    "email": "string"
  },
  "businessHours": {
    "monday": {
      "isOpen": true,
      "openTime": "09:00",
      "closeTime": "22:00"
    }
  },
  "deliveryOptions": {
    "hasDelivery": true,
    "deliveryFee": 50,
    "deliveryRadius": 5000
  }
}
```

### Get Store by ID
- **GET** `/api/v1/stores/:id`
- **Description**: Get store by ID
- **Headers**: `Authorization: Bearer <token>`

### Update Store
- **PUT** `/api/v1/stores/:id`
- **Description**: Update store information
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Store update object

### Get My Store
- **GET** `/api/v1/stores/my`
- **Description**: Get current user's store
- **Headers**: `Authorization: Bearer <token>`

### Update Business Hours
- **PUT** `/api/v1/stores/:storeId/business-hours`
- **Description**: Update store business hours
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Business hours object

### Update Delivery Zones
- **PUT** `/api/v1/stores/:storeId/delivery-zones`
- **Description**: Update store delivery zones
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Delivery zones object

### Get Store Products
- **GET** `/api/v1/stores/:storeId/products`
- **Description**: Get products in store
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `status`: product status
  - `category`: product category
  - `sortBy`: createdAt|price-low|price-high|rating|newest
  - `limit`: number of results (default: 20)
  - `page`: page number (default: 1)

### Add Product to Store
- **POST** `/api/v1/stores/:storeId/products`
- **Description**: Add product to store
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Product object

### Update Product
- **PUT** `/api/v1/stores/:storeId/products/:productId`
- **Description**: Update product in store
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Product update object

### Delete Product
- **DELETE** `/api/v1/stores/:storeId/products/:productId`
- **Description**: Delete product from store
- **Headers**: `Authorization: Bearer <token>`

### Update Product Stock
- **PUT** `/api/v1/stores/:storeId/products/:productId/stock`
- **Description**: Update product stock
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "stock": 100
}
```

### Get Store Orders
- **GET** `/api/v1/stores/:storeId/orders`
- **Description**: Get orders for store
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `status`: order status filter
  - `sortBy`: createdAt|newest|oldest|amount-high|amount-low
  - `limit`: number of results (default: 20)
  - `page`: page number (default: 1)

### Update Order Status
- **PUT** `/api/v1/stores/:storeId/orders/:orderId/status`
- **Description**: Update order status
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "status": "confirmed|preparing|ready|cancelled"
}
```

### Get Store Analytics
- **GET** `/api/v1/stores/:storeId/analytics`
- **Description**: Get store analytics
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `period`: day|week|month
  - `startDate`: ISO date string
  - `endDate`: ISO date string

### Get Store Reviews
- **GET** `/api/v1/stores/:storeId/reviews`
- **Description**: Get store reviews
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `limit`: number of results (default: 20)
  - `page`: page number (default: 1)

### Get Nearby Customers
- **GET** `/api/v1/stores/:storeId/customers/nearby`
- **Description**: Get customers near store
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `coordinates`: "longitude,latitude"
  - `radius`: distance in meters (default: 1000)
  - `limit`: number of results (default: 20)
  - `page`: page number (default: 1)

## Order Endpoints

### Get All Orders
- **GET** `/api/v1/orders`
- **Description**: Get all orders (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `status`: order status filter
  - `customer`: customer ID
  - `store`: store ID
  - `dateRange`: "start_date,end_date"
  - `sortBy`: newest|oldest|amount-high|amount-low
  - `limit`: number of results (default: 20)
  - `page`: page number (default: 1)

### Get Order by ID
- **GET** `/api/v1/orders/:id`
- **Description**: Get specific order details
- **Headers**: `Authorization: Bearer <token>`

### Update Order Status (Admin)
- **PUT** `/api/v1/orders/:id/status`
- **Description**: Update order status (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "status": "pending|confirmed|preparing|ready|out_for_delivery|delivered|completed|cancelled|refunded"
}
```

## Payment Endpoints

### Create Payment Intent
- **POST** `/api/v1/payment/intent`
- **Description**: Create payment intent (for Stripe)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "amount": 100,
  "currency": "EGP",
  "orderId": "order_id"
}
```

### Process Payment
- **POST** `/api/v1/payment`
- **Description**: Process payment
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "orderId": "order_id",
  "method": "cash|card|mobile_wallet|wallet",
  "amount": 100,
  "paymentData": {}
}
```

### Get Payment Methods
- **GET** `/api/v1/payment/methods`
- **Description**: Get available payment methods
- **Headers**: `Authorization: Bearer <token>`

### Get Wallet Balance
- **GET** `/api/v1/payment/wallet`
- **Description**: Get user's wallet balance
- **Headers**: `Authorization: Bearer <token>`

### Add Funds to Wallet
- **POST** `/api/v1/payment/wallet/add-funds`
- **Description**: Add funds to wallet
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "amount": 100,
  "paymentMethod": "card|mobile_wallet",
  "paymentToken": "string"
}
```

### Process Refund
- **POST** `/api/v1/payment/refund`
- **Description**: Process payment refund (admin/store only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "paymentId": "payment_id",
  "amount": 50,
  "reason": "string"
}
```

### Get Transaction History
- **GET** `/api/v1/payment/transactions`
- **Description**: Get payment transaction history
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `status`: payment status
  - `startDate`: ISO date string
  - `endDate`: ISO date string
  - `limit`: number of results (default: 20)
  - `page`: page number (default: 1)

## Admin Endpoints

### Get All Users
- **GET** `/api/v1/admin/users`
- **Description**: Get all users (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `role`: user role filter
  - `status`: active|inactive|pending
  - `search`: search query
  - `sortBy`: name|email|newest|oldest|last-active
  - `limit`: number of results (default: 20)
  - `page`: page number (default: 1)

### Get User by ID
- **GET** `/api/v1/admin/users/:id`
- **Description**: Get user by ID (admin only)
- **Headers**: `Authorization: Bearer <token>`

### Update User Role
- **PUT** `/api/v1/admin/users/:id/role`
- **Description**: Update user role (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "role": "customer|driver|store|admin|superadmin"
}
```

### Update User Status
- **PATCH** `/api/v1/admin/users/:id/status`
- **Description**: Update user status (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "status": "active|inactive|suspended|banned"
}
```

### Delete User
- **DELETE** `/api/v1/admin/users/:id`
- **Description**: Delete user (soft delete) (admin only)
- **Headers**: `Authorization: Bearer <token>`

### Get All Stores
- **GET** `/api/v1/admin/stores`
- **Description**: Get all stores (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `status`: store status filter
  - `search`: search query
  - `sortBy`: name|rating|newest|oldest
  - `limit`: number of results (default: 20)
  - `page`: page number (default: 1)

### Get Store by ID
- **GET** `/api/v1/admin/stores/:id`
- **Description**: Get store by ID (admin only)
- **Headers**: `Authorization: Bearer <token>`

### Update Store Status
- **PUT** `/api/v1/admin/stores/:id/status`
- **Description**: Update store status (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "status": "active|inactive|suspended|closed"
}
```

### Update Commission Rate
- **PUT** `/api/v1/admin/stores/:id/commission`
- **Description**: Update store commission rate (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "commissionRate": 10
}
```

### Delete Store
- **DELETE** `/api/v1/admin/stores/:id`
- **Description**: Delete store (admin only)
- **Headers**: `Authorization: Bearer <token>`

### Get All Orders
- **GET** `/api/v1/admin/orders`
- **Description**: Get all orders (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `status`: order status filter
  - `customer`: customer ID
  - `store`: store ID
  - `dateRange`: "start_date,end_date"
  - `sortBy`: newest|oldest|amount-high|amount-low
  - `limit`: number of results (default: 20)
  - `page`: page number (default: 1)

### Get Order by ID
- **GET** `/api/v1/admin/orders/:id`
- **Description**: Get order by ID (admin only)
- **Headers**: `Authorization: Bearer <token>`

### Update Order Status
- **PUT** `/api/v1/admin/orders/:id/status`
- **Description**: Update order status (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "status": "pending|confirmed|preparing|ready|out_for_delivery|delivered|completed|cancelled|refunded"
}
```

### Get System Analytics
- **GET** `/api/v1/admin/analytics/system`
- **Description**: Get system-wide analytics (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `period`: day|week|month
  - `startDate`: ISO date string
  - `endDate`: ISO date string

### Get User Analytics
- **GET** `/api/v1/admin/analytics/users`
- **Description**: Get user analytics (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `period`: day|week|month
  - `startDate`: ISO date string
  - `endDate`: ISO date string

### Get Store Analytics
- **GET** `/api/v1/admin/analytics/stores`
- **Description**: Get store analytics (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `period`: day|week|month
  - `startDate`: ISO date string
  - `endDate`: ISO date string

### Get Order Analytics
- **GET** `/api/v1/admin/analytics/orders`
- **Description**: Get order analytics (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `period`: day|week|month
  - `startDate`: ISO date string
  - `endDate`: ISO date string

### Get Financial Analytics
- **GET** `/api/v1/admin/analytics/financial`
- **Description**: Get financial analytics (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `period`: day|week|month
  - `startDate`: ISO date string
  - `endDate`: ISO date string

## Security Features

### Authentication
- JWT-based authentication with refresh tokens
- Multi-role system (customer, driver, store, admin)
- Role-based access control (RBAC)
- Phone number verification with OTP
- Account status management

### Rate Limiting
- Configurable rate limiting per IP
- Protection against brute force attacks
- OTP attempt limits

### Input Validation
- Express-validator for request validation
- MongoDB sanitization against NoSQL injection
- XSS protection
- HPP (HTTP Parameter Pollution) prevention

### Other Security Measures
- Helmet.js for security headers
- CORS configuration
- Password hashing with bcrypt
- Secure cookie settings
- Account lockout after failed attempts

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

## Response Format

Successful responses follow this format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    "result": "actual data"
  }
}
```

## Rate Limits

- Default: 250 requests per 10 minutes per IP
- OTP requests: Limited to prevent spam
- Failed login attempts: Account lockout after multiple failures

## Deployment

### Environment Variables Required
- `MONGODB_URI`: Database connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_REFRESH_SECRET`: JWT refresh token secret
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_PHONE_NUMBER`: Twilio phone number
- `STRIPE_SECRET_KEY`: Stripe secret key
- `EMAIL_USER`: SMTP username
- `EMAIL_PASS`: SMTP password
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development|production)
