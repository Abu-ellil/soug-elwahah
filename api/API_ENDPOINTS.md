# Tawseelah API Endpoints Documentation

Complete list of all API endpoints organized by user type and functionality.

## Base URL

```
http://localhost:5000/api
```

---

## 1. General Authentication Routes

**Base Path:** `/api/auth`

| Method | Endpoint                     | Description                  | Access  | File                                          |
| ------ | ---------------------------- | ---------------------------- | ------- | --------------------------------------------- |
| POST   | `/register`                  | Register new user (any role) | Public  | [`auth/routes.js`](modules/auth/routes.js:16) |
| POST   | `/login`                     | Login user                   | Public  | [`auth/routes.js`](modules/auth/routes.js:27) |
| POST   | `/logout`                    | Logout user                  | Private | [`auth/routes.js`](modules/auth/routes.js:35) |
| GET    | `/me`                        | Get current user profile     | Private | [`auth/routes.js`](modules/auth/routes.js:40) |
| PUT    | `/me`                        | Update current user profile  | Private | [`auth/routes.js`](modules/auth/routes.js:45) |
| POST   | `/forgotpassword`            | Request password reset       | Public  | [`auth/routes.js`](modules/auth/routes.js:54) |
| PUT    | `/resetpassword/:resettoken` | Reset password with token    | Public  | [`auth/routes.js`](modules/auth/routes.js:61) |
| GET    | `/verify/:verificationtoken` | Verify email address         | Public  | [`auth/routes.js`](modules/auth/routes.js:68) |

## 2. Specific User Type Authentication Routes

### Customer Authentication
**Base Path:** `/api/auth/customer`

| Method | Endpoint                     | Description                  | Access  | File                                                |
| ------ | ---------------------------- | ---------------------------- | ------- | --------------------------------------------------- |
| POST   | `/register`                  | Register new customer        | Public  | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:20) |
| POST   | `/login`                     | Customer login               | Public  | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:21) |
| GET    | `/me`                        | Get customer profile         | Private | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:23) |
| PUT    | `/me`                        | Update customer details      | Private | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:24) |
| PUT    | `/me/password`               | Update customer password     | Private | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:26) |
| POST   | `/forgotpassword`            | Forgot password              | Public  | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:27) |
| PUT    | `/resetpassword/:resettoken` | Reset password               | Public  | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:28) |
| GET    | `/logout`                    | Customer logout              | Private | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:29) |

### Driver Authentication
**Base Path:** `/api/auth/driver`

| Method | Endpoint                     | Description                  | Access  | File                                                |
| ------ | ---------------------------- | ---------------------------- | ------- | --------------------------------------------------- |
| POST   | `/register`                  | Register new driver          | Public  | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:32) |
| POST   | `/login`                     | Driver login                 | Public  | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:33) |
| GET    | `/me`                        | Get driver profile           | Private | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:35) |
| PUT    | `/me`                        | Update driver details        | Private | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:36) |
| PUT    | `/me/password`               | Update driver password       | Private | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:38) |
| POST   | `/forgotpassword`            | Forgot password              | Public  | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:39) |
| PUT    | `/resetpassword/:resettoken` | Reset password               | Public  | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:40) |
| GET    | `/logout`                    | Driver logout                | Private | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:41) |

### Store Owner Authentication
**Base Path:** `/api/auth/storeowner`

| Method | Endpoint                     | Description                  | Access  | File                                                |
| ------ | ---------------------------- | ---------------------------- | ------- | --------------------------------------------------- |
| POST   | `/register`                  | Register new store owner     | Public  | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:44) |
| POST   | `/login`                     | Store owner login            | Public  | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:45) |
| GET    | `/me`                        | Get store owner profile      | Private | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:47) |
| PUT    | `/me`                        | Update store owner details   | Private | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:48) |
| PUT    | `/me/password`               | Update store owner password  | Private | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:50) |
| POST   | `/forgotpassword`            | Forgot password              | Public  | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:51) |
| PUT    | `/resetpassword/:resettoken` | Reset password               | Public  | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:52) |
| GET    | `/logout`                    | Store owner logout           | Private | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:53) |

### Admin Authentication
**Base Path:** `/api/auth/admin`

| Method | Endpoint                     | Description                  | Access  | File                                                |
| ------ | ---------------------------- | ---------------------------- | ------- | --------------------------------------------------- |
| POST   | `/register`                  | Register new admin           | Public  | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:56) |
| POST   | `/login`                     | Admin login                  | Public  | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:57) |
| GET    | `/me`                        | Get admin profile            | Private | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:59) |
| PUT    | `/me`                        | Update admin details         | Private | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:60) |
| PUT    | `/me/password`               | Update admin password        | Private | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:62) |
| POST   | `/forgotpassword`            | Forgot password              | Public  | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:63) |
| PUT    | `/resetpassword/:resettoken` | Reset password               | Public  | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:64) |
| GET    | `/logout`                    | Admin logout                 | Private | [`auth/specificAuthRoutes.js`](modules/auth/specificAuthRoutes.js:65) |

---

## 2. Customer Routes

**Base Path:** `/api/customers`

### Basic Customer Auth

| Method | Endpoint                     | Description              | Access  | File                                                    |
| ------ | ---------------------------- | ------------------------ | ------- | ------------------------------------------------------- |
| POST   | `/register`                  | Register new customer    | Public  | [`customers/routes.js`](modules/customers/routes.js:28) |
| POST   | `/login`                     | Customer login           | Public  | [`customers/routes.js`](modules/customers/routes.js:29) |
| POST   | `/logout`                    | Customer logout          | Public  | [`customers/routes.js`](modules/customers/routes.js:30) |
| POST   | `/forgotpassword`            | Forgot password          | Public  | [`customers/routes.js`](modules/customers/routes.js:31) |
| PUT    | `/resetpassword/:resettoken` | Reset password           | Public  | [`customers/routes.js`](modules/customers/routes.js:32) |
| GET    | `/me`                        | Get customer profile     | Private | [`customers/routes.js`](modules/customers/routes.js:40) |
| PUT    | `/me`                        | Update customer details  | Private | [`customers/routes.js`](modules/customers/routes.js:41) |
| PUT    | `/me/password`               | Update customer password | Private | [`customers/routes.js`](modules/customers/routes.js:42) |

### Advanced Customer Auth

**Base Path:** `/api/customers/auth`

| Method | Endpoint         | Description                          | Access | File                                                                            |
| ------ | ---------------- | ------------------------------------ | ------ | ------------------------------------------------------------------------------- |
| POST   | `/auth/login`    | Advanced login (email/phone)         | Public | [`customers/advancedAuthRoutes.js`](modules/customers/advancedAuthRoutes.js:26) |
| POST   | `/auth/social`   | Social login (Google/Facebook/Apple) | Public | [`customers/advancedAuthRoutes.js`](modules/customers/advancedAuthRoutes.js:34) |
| POST   | `/auth/register` | Advanced registration                | Public | [`customers/advancedAuthRoutes.js`](modules/customers/advancedAuthRoutes.js:42) |

### Customer Features

| Method | Endpoint                    | Description                | Access  | File                                                                            |
| ------ | --------------------------- | -------------------------- | ------- | ------------------------------------------------------------------------------- |
| PUT    | `/wishlist/:productId`      | Toggle product in wishlist | Private | [`customers/advancedAuthRoutes.js`](modules/customers/advancedAuthRoutes.js:50) |
| GET    | `/wishlist`                 | Get customer wishlist      | Private | [`customers/advancedAuthRoutes.js`](modules/customers/advancedAuthRoutes.js:55) |
| POST   | `/reviews`                  | Add/update product review  | Private | [`customers/advancedAuthRoutes.js`](modules/customers/advancedAuthRoutes.js:60) |
| GET    | `/reviews`                  | Get customer reviews       | Private | [`customers/advancedAuthRoutes.js`](modules/customers/advancedAuthRoutes.js:69) |
| PUT    | `/favorite-stores/:storeId` | Toggle favorite store      | Private | [`customers/advancedAuthRoutes.js`](modules/customers/advancedAuthRoutes.js:74) |
| GET    | `/favorite-stores`          | Get favorite stores        | Private | [`customers/advancedAuthRoutes.js`](modules/customers/advancedAuthRoutes.js:79) |

---

## 3. Driver Routes

**Base Path:** `/api/drivers`

### Driver Authentication
| Method | Endpoint                     | Description             | Access  | File                                                |
| ------ | ---------------------------- | ----------------------- | ------- | --------------------------------------------------- |
| POST   | `/register`                  | Register new driver     | Public  | [`drivers/routes.js`](modules/drivers/routes.js:25) |
| POST   | `/login`                     | Driver login            | Public  | [`drivers/routes.js`](modules/drivers/routes.js:26) |
| POST   | `/logout`                    | Driver logout           | Public  | [`drivers/routes.js`](modules/drivers/routes.js:27) |
| POST   | `/forgotpassword`            | Forgot password         | Public  | [`drivers/routes.js`](modules/drivers/routes.js:28) |
| PUT    | `/resetpassword/:resettoken` | Reset password          | Public  | [`drivers/routes.js`](modules/drivers/routes.js:29) |

### Driver Profile Management
| Method | Endpoint                     | Description             | Access  | File                                                |
| ------ | ---------------------------- | ----------------------- | ------- | --------------------------------------------------- |
| GET    | `/me`                        | Get driver profile      | Private | [`drivers/routes.js`](modules/drivers/routes.js:34) |
| PUT    | `/me`                        | Update driver details   | Private | [`drivers/routes.js`](modules/drivers/routes.js:35) |
| PUT    | `/me/password`               | Update driver password  | Private | [`drivers/routes.js`](modules/drivers/routes.js:36) |
| PUT    | `/me/documents`              | Upload driver documents | Private | [`drivers/routes.js`](modules/drivers/routes.js:37) |
| PUT    | `/me/online`                 | Update online status    | Private | [`drivers/routes.js`](modules/drivers/routes.js:38) |

### Driver Management (Admin/System)
| Method | Endpoint         | Description                        | Access          |
| ------ | ---------------- | ---------------------------------- | --------------- |
| GET    | `/`              | Get all drivers                    | Private         |
| GET    | `/:id`           | Get driver by ID                   | Private         |
| PUT    | `/:id`           | Update driver                      | Private         |
| DELETE | `/:id`           | Delete driver                      | Private (Admin) |
| PUT    | `/:id/documents` | Update driver documents            | Private         |
| PUT    | `/:id/verify`    | Verify driver documents            | Private (Admin) |
| GET    | `/pending`       | Get pending verification drivers   | Private (Admin) |
| PUT    | `/:id/location`  | Update driver location (real-time) | Private         |

---

## 4. Store Owner Routes

**Base Path:** `/api/storeowners`

| Method | Endpoint                     | Description                  | Access  | File                                                        |
| ------ | ---------------------------- | ---------------------------- | ------- | ----------------------------------------------------------- |
| POST   | `/register`                  | Register new store owner     | Public  | [`storeowners/routes.js`](modules/storeowners/routes.js:24) |
| POST   | `/login`                     | Store owner login            | Public  | [`storeowners/routes.js`](modules/storeowners/routes.js:25) |
| POST   | `/logout`                    | Store owner logout           | Public  | [`storeowners/routes.js`](modules/storeowners/routes.js:26) |
| POST   | `/forgotpassword`            | Forgot password              | Public  | [`storeowners/routes.js`](modules/storeowners/routes.js:27) |
| PUT    | `/resetpassword/:resettoken` | Reset password               | Public  | [`storeowners/routes.js`](modules/storeowners/routes.js:28) |
| GET    | `/me`                        | Get store owner profile      | Private | [`storeowners/routes.js`](modules/storeowners/routes.js:33) |
| PUT    | `/me`                        | Update store owner details   | Private | [`storeowners/routes.js`](modules/storeowners/routes.js:34) |
| PUT    | `/me/password`               | Update store owner password  | Private | [`storeowners/routes.js`](modules/storeowners/routes.js:35) |
| PUT    | `/me/documents`              | Upload store owner documents | Private | [`storeowners/routes.js`](modules/storeowners/routes.js:36) |

---

## 5. Store Routes

**Base Path:** `/api/stores`

| Method | Endpoint                        | Description          | Access                | File                                              |
| ------ | ------------------------------- | -------------------- | --------------------- | ------------------------------------------------- |
| GET    | `/`                             | Get all stores       | Public                | [`stores/routes.js`](modules/stores/routes.js:25) |
| GET    | `/:id`                          | Get single store     | Public                | [`stores/routes.js`](modules/stores/routes.js:30) |
| POST   | `/`                             | Create new store     | Private (Store Owner) | [`stores/routes.js`](modules/stores/routes.js:35) |
| PUT    | `/:id`                          | Update store         | Private (Store Owner) | [`stores/routes.js`](modules/stores/routes.js:40) |
| DELETE | `/:id`                          | Delete store         | Private (Store Owner) | [`stores/routes.js`](modules/stores/routes.js:45) |
| GET    | `/owner/:ownerId`               | Get stores by owner  | Private               | [`stores/routes.js`](modules/stores/routes.js:50) |
| POST   | `/:id/products`                 | Add product to store | Private (Store Owner) | [`stores/routes.js`](modules/stores/routes.js:55) |
| PUT    | `/:storeId/products/:productId` | Update product       | Private (Store Owner) | [`stores/routes.js`](modules/stores/routes.js:60) |
| DELETE | `/:storeId/products/:productId` | Delete product       | Private (Store Owner) | [`stores/routes.js`](modules/stores/routes.js:65) |

---

## 6. Order Routes

**Base Path:** `/api/orders`

| Method | Endpoint                | Description            | Access             | File                                              |
| ------ | ----------------------- | ---------------------- | ------------------ | ------------------------------------------------- |
| GET    | `/`                     | Get all orders         | Private (Admin)    | [`orders/routes.js`](modules/orders/routes.js:25) |
| GET    | `/:id`                  | Get single order       | Private            | [`orders/routes.js`](modules/orders/routes.js:30) |
| POST   | `/`                     | Create new order       | Private (Customer) | [`orders/routes.js`](modules/orders/routes.js:35) |
| PUT    | `/:id`                  | Update order           | Private            | [`orders/routes.js`](modules/orders/routes.js:40) |
| DELETE | `/:id`                  | Delete order           | Private (Admin)    | [`orders/routes.js`](modules/orders/routes.js:45) |
| GET    | `/customer/:customerId` | Get orders by customer | Private            | [`orders/routes.js`](modules/orders/routes.js:50) |
| GET    | `/store/:storeId`       | Get orders by store    | Private            | [`orders/routes.js`](modules/orders/routes.js:55) |
| GET    | `/driver/:driverId`     | Get orders by driver   | Private            | [`orders/routes.js`](modules/orders/routes.js:60) |
| PUT    | `/:id/status`           | Update order status    | Private            | [`orders/routes.js`](modules/orders/routes.js:65) |

---

## 7. Payment Routes

**Base Path:** `/api/payments`

| Method | Endpoint          | Description           | Access          | File                                                  |
| ------ | ----------------- | --------------------- | --------------- | ----------------------------------------------------- |
| POST   | `/process`        | Process payment       | Private         | [`payments/routes.js`](modules/payments/routes.js:21) |
| GET    | `/:id`            | Get payment by ID     | Private         | [`payments/routes.js`](modules/payments/routes.js:26) |
| GET    | `/user/:userId`   | Get payments by user  | Private         | [`payments/routes.js`](modules/payments/routes.js:31) |
| GET    | `/order/:orderId` | Get payments by order | Private         | [`payments/routes.js`](modules/payments/routes.js:36) |
| PUT    | `/:id/refund`     | Refund payment        | Private (Admin) | [`payments/routes.js`](modules/payments/routes.js:41) |

---

## 8. Notification Routes

**Base Path:** `/api/notifications`

| Method | Endpoint    | Description                | Access          | File                                                            |
| ------ | ----------- | -------------------------- | --------------- | --------------------------------------------------------------- |
| GET    | `/`         | Get all user notifications | Private         | [`notifications/routes.js`](modules/notifications/routes.js:24) |
| GET    | `/:id`      | Get single notification    | Private         | [`notifications/routes.js`](modules/notifications/routes.js:29) |
| POST   | `/`         | Create notification        | Private (Admin) | [`notifications/routes.js`](modules/notifications/routes.js:34) |
| PUT    | `/:id`      | Update notification        | Private         | [`notifications/routes.js`](modules/notifications/routes.js:39) |
| DELETE | `/:id`      | Delete notification        | Private         | [`notifications/routes.js`](modules/notifications/routes.js:44) |
| GET    | `/unread`   | Get unread notifications   | Private         | [`notifications/routes.js`](modules/notifications/routes.js:49) |
| PUT    | `/:id/read` | Mark notification as read  | Private         | [`notifications/routes.js`](modules/notifications/routes.js:54) |
| PUT    | `/read/all` | Mark all as read           | Private         | [`notifications/routes.js`](modules/notifications/routes.js:59) |

---

## 9. User Management Routes

**Base Path:** `/api/users`

| Method | Endpoint        | Description          | Access          | File                                            |
| ------ | --------------- | -------------------- | --------------- | ----------------------------------------------- |
| GET    | `/`             | Get all users        | Private (Admin) | [`users/routes.js`](modules/users/routes.js:21) |
| GET    | `/:id`          | Get single user      | Private         | [`users/routes.js`](modules/users/routes.js:26) |
| PUT    | `/:id`          | Update user          | Private         | [`users/routes.js`](modules/users/routes.js:31) |
| DELETE | `/:id`          | Delete user          | Private (Admin) | [`users/routes.js`](modules/users/routes.js:36) |
| PUT    | `/:id/location` | Update user location | Private         | [`users/routes.js`](modules/users/routes.js:41) |

---

## 10. Admin Routes

**Base Path:** `/api/admin`

| Method | Endpoint        | Description              | Access          | File                                            |
| ------ | --------------- | ------------------------ | --------------- | ----------------------------------------------- |
| GET    | `/dashboard`    | Get dashboard statistics | Private (Admin) | [`admin/routes.js`](modules/admin/routes.js:24) |
| GET    | `/users`        | Get all users            | Private (Admin) | [`admin/routes.js`](modules/admin/routes.js:29) |
| GET    | `/stores`       | Get all stores           | Private (Admin) | [`admin/routes.js`](modules/admin/routes.js:34) |
| GET    | `/orders`       | Get all orders           | Private (Admin) | [`admin/routes.js`](modules/admin/routes.js:39) |
| GET    | `/drivers`      | Get all drivers          | Private (Admin) | [`admin/routes.js`](modules/admin/routes.js:44) |
| GET    | `/transactions` | Get all transactions     | Private (Admin) | [`admin/routes.js`](modules/admin/routes.js:49) |
| PUT    | `/settings`     | Update admin settings    | Private (Admin) | [`admin/routes.js`](modules/admin/routes.js:54) |
| GET    | `/settings`     | Get admin settings       | Private (Admin) | [`admin/routes.js`](modules/admin/routes.js:59) |

---

## Authentication Methods

### 1. Email/Password Authentication

- Traditional username and password
- Used by all user types
- Requires email verification

### 2. Phone/Password Authentication

- Phone number-based authentication
- Available for customers
- SMS verification support

### 3. Social Authentication (OAuth)

- **Google** - OAuth 2.0
- **Facebook** - OAuth 2.0
- **Apple** - Sign in with Apple
- Available for customers only
- Auto-verified accounts

### 4. JWT Token Authentication

- Bearer token in Authorization header
- Format: `Authorization: Bearer <token>`
- Token expiration configurable via `JWT_EXPIRE`
- Cookie-based session management

---

## Access Levels

| Level                     | Description                 | User Types              |
| ------------------------- | --------------------------- | ----------------------- |
| **Public**                | No authentication required  | Anyone                  |
| **Private**               | Requires valid JWT token    | All authenticated users |
| **Private (Customer)**    | Customer-specific access    | Customers only          |
| **Private (Driver)**      | Driver-specific access      | Drivers only            |
| **Private (Store Owner)** | Store owner-specific access | Store owners only       |
| **Private (Admin)**       | Admin-only access           | Admins only             |

---

## Request Headers

### Required for Private Routes

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Optional

```
Accept-Language: en|ar
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

---

## Pagination

For list endpoints that support pagination:

### Query Parameters

```
?page=1&limit=10&sort=-createdAt
```

### Response Format

```json
{
  "success": true,
  "count": 100,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 10
  },
  "data": [ ... ]
}
```

---

## WebSocket Events

The API also supports real-time communication via Socket.IO:

### Connection

```javascript
const socket = io("http://localhost:5000", {
  auth: { token: "jwt_token" },
});
```

### Events

- `order:created` - New order created
- `order:updated` - Order status updated
- `driver:location` - Driver location update
- `notification:new` - New notification received

---

## Rate Limiting

- **General endpoints:** 100 requests per 15 minutes
- **Auth endpoints:** 5 requests per 15 minutes
- **Admin endpoints:** 200 requests per 15 minutes

---

## Error Codes

| Code | Description           |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 500  | Internal Server Error |

---

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. All monetary values are in the currency specified by `CURRENCY` env variable (default: EGP)
3. File uploads support: images (jpg, png), documents (pdf)
4. Maximum file size: 5MB per file
5. API versioning: Currently v1 (implicit)

---

## Related Documentation

- [Environment Variables](ENV_VARIABLES.md)
- [Database Models](models/)
- [API Controllers](modules/)
