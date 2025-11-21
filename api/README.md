# Tawseela Grocery Delivery API

A comprehensive grocery delivery system API with multi-role support for customers, drivers, store owners, and administrators.

## Features

### User Management
- Phone number based registration and authentication
- Multi-role system (customer, driver, store_owner, service_provider, admin)
- OTP verification via SMS
- Role-based access control
- Account status management (pending, active, suspended, banned)

### Store Management
- Store creation and management
- Product catalog management
- Business hours configuration
- Delivery zones setup
- Store approval workflow
- Inventory management
- Store analytics and reporting

### Order Management
- Order creation with multiple items
- Price negotiation and bidding system for drivers
- Order status tracking
- Multiple payment methods
- Order scheduling
- Cancellation and refund system

### Customer Features
- Nearby store discovery
- Product search and filtering
- Favorites and wishlist
- Reviews and ratings
- Order history
- Delivery tracking

### Driver Features
- Nearby order discovery
- Bidding system with price negotiation
- Order status updates
- Earnings tracking
- Performance analytics
- Availability management

### Admin Features
- Complete system oversight
- User management (roles, status, permissions)
- Store management and approval
- Order management
- Comprehensive analytics
- Financial reporting
- System configuration

### Payment System
- Multiple payment methods (card, wallet, cash)
- Digital wallet with transaction history
- Refund processing
- Stripe integration
- Commission management

### Security Features
- JWT-based authentication
- Rate limiting
- Input validation
- Account lockout protection
- Phone number verification
- Role-based access control

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh token
- `POST /api/auth/resend-otp` - Resend OTP
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Customer
- `GET /api/customer/stores/nearby` - Get nearby stores
- `GET /api/customer/products/search` - Search products
- `POST /api/customer/orders` - Create order
- `GET /api/customer/orders` - Get customer orders
- `GET /api/customer/orders/:id` - Get order details
- `PUT /api/customer/orders/:id/cancel` - Cancel order
- `POST /api/customer/favorites` - Add to favorites
- `DELETE /api/customer/favorites` - Remove from favorites
- `GET /api/customer/favorites` - Get favorites
- `POST /api/customer/reviews` - Add review
- `GET /api/customer/reviews/store/:storeId` - Get store reviews
- `GET /api/customer/reviews/driver/:driverId` - Get driver reviews

### Driver
- `GET /api/driver/orders/nearby` - Get nearby orders
- `POST /api/driver/orders/:orderId/bid` - Bid on order
- `PUT /api/driver/orders/:orderId/bid` - Update bid price
- `GET /api/driver/orders` - Get driver orders
- `PUT /api/driver/orders/:orderId/status` - Update order status
- `GET /api/driver/profile` - Get driver profile
- `PUT /api/driver/profile` - Update driver profile
- `PUT /api/driver/availability` - Update availability
- `GET /api/driver/earnings` - Get earnings
- `GET /api/driver/analytics` - Get analytics
- `POST /api/driver/orders/:orderId/accept` - Accept order bid
- `GET /api/driver/bids` - Get bid history

### Store
- `POST /api/store` - Create store
- `GET /api/store/:id` - Get store profile
- `PUT /api/store/:id` - Update store
- `GET /api/store/my` - Get my store
- `PUT /api/store/:storeId/business-hours` - Update business hours
- `PUT /api/store/:storeId/delivery-zones` - Update delivery zones
- `GET /api/store/:storeId/products` - Get store products
- `POST /api/store/:storeId/products` - Add product
- `PUT /api/store/:storeId/products/:productId` - Update product
- `DELETE /api/store/:storeId/products/:productId` - Delete product
- `PUT /api/store/:storeId/products/:productId/stock` - Update stock
- `GET /api/store/:storeId/orders` - Get store orders
- `PUT /api/store/:storeId/orders/:orderId/status` - Update order status
- `GET /api/store/:storeId/analytics` - Get store analytics
- `GET /api/store/:storeId/reviews` - Get store reviews
- `GET /api/store/:storeId/customers/nearby` - Get nearby customers

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id/role` - Update user role
- `PUT /api/admin/users/:id/status` - Update user status
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stores` - Get all stores
- `GET /api/admin/stores/:id` - Get store by ID
- `PUT /api/admin/stores/:id/status` - Update store status
- `PUT /api/admin/stores/:id/commission` - Update commission rate
- `DELETE /api/admin/stores/:id` - Delete store
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/:id` - Get order by ID
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/analytics/system` - System analytics
- `GET /api/admin/analytics/users` - User analytics
- `GET /api/admin/analytics/stores` - Store analytics
- `GET /api/admin/analytics/orders` - Order analytics
- `GET /api/admin/analytics/financial` - Financial analytics

### Payment
- `POST /api/payment/intent` - Create payment intent
- `POST /api/payment` - Process payment
- `GET /api/payment/methods` - Get payment methods
- `POST /api/payment/methods` - Add payment method
- `GET /api/payment/wallet` - Get wallet balance
- `POST /api/payment/wallet/add-funds` - Add funds to wallet
- `POST /api/payment/refund` - Process refund
- `GET /api/payment/transactions` - Get transaction history

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with environment variables
4. Start the server: `npm run dev`

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/tawseela-grocery

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRE=30d

# Twilio (for SMS verification)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# Stripe (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Server
PORT=5000
NODE_ENV=development
```

## Deployment to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Set up environment variables in Vercel dashboard:
   - Go to your Vercel project settings
   - Add all environment variables from your `.env` file
   - Make sure to add sensitive variables like JWT secrets, API keys, etc.
4. Deploy the project: `vercel --prod`
5. Or use the Vercel dashboard to connect your GitHub repository for automatic deployments

The `vercel.json` file is already configured for this project and includes:
- Proper build configuration for Express.js
- Environment variable mapping
- Route handling for API endpoints
- Security configurations

Your API will be deployed and accessible at `https://your-project-name.vercel.app`

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Stripe for payments
- Twilio for SMS
- Nodemailer for email
- Express-validator for validation
- CORS, Helmet, Rate limiting for security

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting to prevent abuse
- Input validation and sanitization
- Account lockout after failed attempts
- Phone number verification
- Role-based access control
- Secure payment processing

## Database Models

- User: Customer, driver, store owner, admin profiles
- Store: Store information and settings
- Product: Product catalog
- Order: Order management and tracking
- Review: User reviews and ratings
- Favorite: Favorites and wishlist
- Wallet: Digital wallet system
- Notification: Push notifications
- Payment: Payment processing and records
