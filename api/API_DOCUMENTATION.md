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
