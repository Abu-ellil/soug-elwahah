# Egyptian Villages Delivery API

A comprehensive backend API for a delivery service that connects customers with local stores and drivers in Egyptian villages. Built with Express.js, MongoDB, and deployed on Vercel.

## 🚀 Features

- **Multi-role Authentication**: Customer, Store Owner, and Driver authentication
- **Real-time Tracking**: GPS-based location tracking for drivers
- **Push Notifications**: FCM-based notifications for order updates
- **Order Management**: Complete order lifecycle from creation to delivery
- **Product Management**: Store owners can manage their products
- **Payment Integration Ready**: Supports cash, mobile payments, and card
- **Geolocation Services**: Find nearby stores based on customer location

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Deployment**: Vercel (Serverless Functions)

## 📁 Project Structure

```
delivery-api/
├── api/
│   └── index.js                    # Vercel serverless entry point
├── src/
│   ├── config/
│   │   ├── database.js            # MongoDB connection
│   │   ├── cloudinary.js          # Cloudinary config
│   │   ├── firebase.js            # Firebase Admin SDK (FCM)
│   │   └── constants.js           # App constants
│   ├── models/
│   │   ├── User.js                # Customer model
│   │   ├── StoreOwner.js          # Store owner model
│   │   ├── Store.js               # Store model
│   │   ├── Product.js             # Product model
│   │   ├── Order.js               # Order model
│   │   ├── Address.js             # Address model
│   │   ├── Category.js            # Category model
│   │   ├── Driver.js              # Driver model
│   │   └── Notification.js        # Notification log model
│   ├── routes/
│   │   ├── auth.routes.js         # Auth routes (Login/Register for all)
│   │   ├── customer/              # Customer routes folder
│   │   │   ├── index.js
│   │   │   ├── profile.routes.js
│   │   │   ├── orders.routes.js
│   │   │   ├── addresses.routes.js
│   │   │   ├── stores.routes.js
│   │   │   ├── products.routes.js
│   │   │   ├── notifications.routes.js
│   │   │   └── tracking.routes.js
│   │   ├── store/                 # Store Owner routes folder
│   │   │   ├── index.js
│   │   │   ├── profile.routes.js
│   │   │   ├── store.routes.js
│   │   │   ├── products.routes.js
│   │   │   ├── orders.routes.js
│   │   │   ├── statistics.routes.js
│   │   │   └── notifications.routes.js
│   │   ├── driver/                # Driver routes folder
│   │   │   ├── index.js
│   │   │   ├── profile.routes.js
│   │   │   ├── orders.routes.js
│   │   │   ├── tracking.routes.js
│   │   │   ├── earnings.routes.js
│   │   │   └── notifications.routes.js
│   │   ├── category.routes.js     # Public categories
│   │   └── upload.routes.js       # Shared upload
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── customer/              # Customer controllers folder
│   │   │   ├── profile.controller.js
│   │   │   ├── orders.controller.js
│   │   │   ├── addresses.controller.js
│   │   │   ├── stores.controller.js
│   │   │   ├── notifications.controller.js
│   │   │   └── tracking.controller.js
│   │   ├── store/                 # Store controllers folder
│   │   │   ├── profile.controller.js
│   │   │   ├── store.controller.js
│   │   │   ├── products.controller.js
│   │   │   ├── orders.controller.js
│   │   │   ├── statistics.controller.js
│   │   │   └── notifications.controller.js
│   │   ├── driver/                # Driver controllers folder
│   │   │   ├── profile.controller.js
│   │   │   ├── orders.controller.js
│   │   │   ├── tracking.controller.js
│   │   │   ├── earnings.controller.js
│   │   │   └── notifications.controller.js
│   │   ├── category.controller.js
│   │   └── upload.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js     # JWT verification
│   │   ├── validation.middleware.js
│   │   ├── error.middleware.js
│   │   └── upload.middleware.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── product.validator.js
│   │   ├── order.validator.js
│   │   └── store.validator.js
│   ├── services/
│   │   ├── notification.service.js # FCM notifications
│   │   └── tracking.service.js     # Real-time tracking logic
│   ├── utils/
│   │   ├── jwt.js                 # JWT helper
│   │   ├── distance.js            # GPS distance calculation
│   │   ├── response.js            # Response formatter
│   │   └── seeders.js             # Database seeding
│   └── app.js                     # Express app setup
├── .env.example
├── .gitignore
├── package.json
├── vercel.json                     # Vercel configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Firebase project for FCM

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd delivery-api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add the required environment variables:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/delivery_db

# JWT
JWT_SECRET=your_super_secret_key_here_change_in_production

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Firebase Cloud Messaging (FCM)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40project-id.iam.gserviceaccount.com

# App
API_BASE_URL=http://localhost:5000/api
```

4. Run the database seed to populate initial data (optional but recommended for testing):

```bash
npm run seed
```

> **Note**: This will clear all existing data and create sample users, store owners, stores, categories, and products for testing purposes. The seed data includes:
>
> - 3 sample categories (Grocery, Bakery, Fruits & Vegetables)
> - 3 sample users (customers)
> - 3 sample store owners
> - 3 sample stores
> - Various sample products across different stores

5. Start the development server:

```bash
npm run dev
```

### Database Seeding

The application includes several scripts to help with database seeding and management:

```bash
# Seed the database with sample data (this will clear existing data first)
npm run seed

# Alternative: Run the enhanced seed script with confirmation prompts
npm run seed:full

# Clear all data from the database without adding sample data
npm run seed:clear
```

The enhanced seed script (`npm run seed:full`) provides additional features like confirmation prompts and more detailed output about the seeding process. The sample data includes customers, store owners, stores, categories, and products for testing purposes.

The API will be available at `http://localhost:5000/api`

## 🌐 API Endpoints

### Public Endpoints

#### Health Check

```
GET /api/health
Response: { success: true, message: "API is running" }
```

#### Categories

```
GET /api/categories
Response: { success, data: { categories }, message }
```

### Authentication Endpoints (`/api/auth`)

#### Register Customer

```
POST /api/auth/customer/register
Body: { name, phone, password }
Response: { success, data: { user, token }, message }
```

#### Register Store Owner

```
POST /api/auth/store/register
Body: { name, phone, password }
Response: { success, data: { owner, token }, message }
```

#### Register Driver

```
POST /api/auth/driver/register
Body: FormData {
  name, phone, password,
  vehicleType, vehicleNumber,
  nationalId: File, drivingLicense: File
}
Response: { success, data: { driver }, message: 'سيتم مراجعة طلبك خلال 24 ساعة' }
```

#### Login (Unified)

```
POST /api/auth/login
Body: { phone, password, role: 'customer' | 'store' | 'driver' }
Response: { success, data: { user/owner/driver, token, role }, message }
```

#### Get Current User

```
GET /api/auth/me
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { user, role }, message }
```

### Customer Endpoints (`/api/customer`)

#### Profile Management

```
GET /api/customer/profile                    # Get profile
PUT /api/customer/profile                   # Update profile
```

#### Addresses

```
GET /api/customer/addresses                 # Get my addresses
POST /api/customer/addresses                # Add address
PUT /api/customer/addresses/:addressId      # Update address
DELETE /api/customer/addresses/:addressId   # Delete address
```

#### Stores & Products

```
GET /api/customer/stores/nearby?lat=31.1107&lng=30.9388&radius=10&categoryId=cat1  # Get nearby stores
GET /api/customer/stores/:storeId           # Get store details
GET /api/customer/stores/search?query=بقالة&villageId=v1  # Search stores
GET /api/customer/stores/:storeId/products?categoryId=cat1_sub1&search=أرز  # Get store products
GET /api/customer/products/:productId       # Get product details
```

#### Orders

```
POST /api/customer/orders                   # Create order
GET /api/customer/orders?status=pending&page=1&limit=20 # Get my orders
GET /api/customer/orders/:orderId           # Get order details
PATCH /api/customer/orders/:orderId/cancel  # Cancel order
POST /api/customer/orders/:orderId/reorder  # Reorder
```

#### Tracking

```
GET /api/customer/tracking/:orderId         # Track order (real-time)
GET /api/customer/tracking/driver/:driverId # Get driver location
```

#### Notifications

```
GET /api/customer/notifications?page=1&limit=20&unreadOnly=false  # Get my notifications
PATCH /api/customer/notifications/:notificationId/read  # Mark as read
PATCH /api/customer/notifications/read-all  # Mark all as read
DELETE /api/customer/notifications/:notificationId  # Delete notification
POST /api/customer/notifications/token      # Update FCM token
```

### Store Owner Endpoints (`/api/store`)

#### Profile Management

```
GET /api/store/profile                      # Get profile
PUT /api/store/profile                      # Update profile
```

#### Store Management

```
GET /api/store/my-store                     # Get my store
PUT /api/store/my-store                     # Update store
PUT /api/store/my-store/image               # Update store image
PATCH /api/store/my-store/toggle-status     # Toggle store status
```

#### Products Management

```
GET /api/store/products?categoryId=cat1_sub1&search=أرز&page=1&limit=20  # Get my products
POST /api/store/products                    # Add product
PUT /api/store/products/:productId          # Update product
PUT /api/store/products/:productId/image    # Update product image
PATCH /api/store/products/:productId/toggle-availability  # Toggle availability
DELETE /api/store/products/:productId       # Delete product
```

#### Orders Management

```
GET /api/store/orders?status=pending&page=1&limit=20  # Get store orders
GET /api/store/orders/:orderId              # Get order details
PATCH /api/store/orders/:orderId/confirm    # Confirm order
PATCH /api/store/orders/:orderId/cancel     # Cancel order
```

#### Statistics

```
GET /api/store/statistics?period=today|week|month  # Get store statistics
```

#### Notifications

```
GET /api/store/notifications?page=1&limit=20  # Get my notifications
PATCH /api/store/notifications/:notificationId/read  # Mark as read
POST /api/store/notifications/token         # Update FCM token
```

### Driver Endpoints (`/api/driver`)

#### Profile Management

```
GET /api/driver/profile                     # Get profile
PUT /api/driver/profile                     # Update profile
PATCH /api/driver/toggle-availability       # Toggle availability
```

#### Orders Management

```
GET /api/driver/orders/available?lat=31.1110&lng=30.9390&radius=10  # Get available orders
POST /api/driver/orders/:orderId/accept     # Accept order
GET /api/driver/orders/active               # Get active order
PATCH /api/driver/orders/:orderId/status    # Update order status
GET /api/driver/orders/:orderId             # Get order details
GET /api/driver/orders/history?period=today|week|month&page=1&limit=20  # Get order history
```

#### Tracking

```
PATCH /api/driver/tracking/location         # Update my location
GET /api/driver/tracking/route/:orderId     # Get order route info
```

#### Earnings

```
GET /api/driver/earnings?period=today|week|month|year  # Get earnings summary
GET /api/driver/statistics                # Get statistics
```

#### Notifications

```
GET /api/driver/notifications?page=1&limit=20 # Get my notifications
PATCH /api/driver/notifications/:notificationId/read  # Mark as read
POST /api/driver/notifications/token      # Update FCM token
```

## 📦 Environment Variables

The application requires several environment variables to function properly. Create a `.env` file in the root directory with the following variables:

- `NODE_ENV`: Environment mode (development/production)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary credentials
- `FIREBASE_*`: Firebase configuration variables for push notifications

## 🛡️ Security Features

- **Rate Limiting**: Prevents abuse with configurable limits per user type
- **Input Validation**: Comprehensive validation using Joi
- **Authentication**: JWT-based authentication with role-based access
- **Security Headers**: Helmet.js for setting security headers
- **CORS Configuration**: Restricted to allowed origins only

## 📊 Database Models

The application uses the following MongoDB collections:

- **User**: Customer information
- **StoreOwner**: Store owner information
- **Store**: Store details and location
- **Product**: Product catalog
- **Order**: Order management
- **Address**: Customer addresses
- **Category**: Product categories
- **Driver**: Driver information
- **Notification**: Notification logs

## 🚚 Deployment

### Vercel Deployment

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Deploy the project:

```bash
vercel
```

4. Set environment variables in Vercel dashboard

### Configuration

The `vercel.json` file contains the necessary configuration for serverless deployment:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 🧪 Testing

To test the API endpoints, you can use:

- Postman collections (recommended)
- curl commands
- Any HTTP client

## 📞 Support

For support, please contact the development team.

## 📄 License

This project is licensed under the MIT License.
