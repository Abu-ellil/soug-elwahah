# Prompt للتطبيق الثالث: Backend API Server (Express.js + Vercel)

## 🎯 Project Overview
أنت Senior Backend Node.js Developer. مطلوب منك تطوير RESTful API كامل باستخدام Express.js لخدمة تطبيقي توصيل القرى المصرية (تطبيق العملاء + تطبيق المحلات). الـ API سيتم deploy على Vercel ويستخدم MongoDB للـ Database.

---

## 🎯 Benefits of This Structure:

### ✅ **Clear Separation of Concerns**
- كل نوع مستخدم له routes منفصلة تماماً
- سهولة في الـ maintenance والتطوير
- تجنب الـ confusion في الـ endpoints

### ✅ **Better Security**
- Middleware خاص لكل نوع مستخدم
- Authorization واضح ومباشر
- صعوبة الوصول لـ endpoints خاطئة

### ✅ **Scalability**
- سهولة إضافة features جديدة لكل نوع
- التعديل على نوع واحد لا يؤثر على الباقي
- Code organization أفضل

### ✅ **Better API Documentation**
- Endpoints منظمة حسب المستخدم
- سهولة الفهم للـ Frontend developers
- Postman Collections منظمة

### ✅ **Performance**
- Rate limiting مختلف لكل نوع
- Caching strategies مخصصة
- Database queries محسّنة

---

## 📁 Route Files Structure Details

### `/api/auth` - Authentication (auth.routes.js)
```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Public routes
router.post('/customer/register', authController.registerCustomer);
router.post('/store/register', authController.registerStore);
router.post('/driver/register', authController.registerDriver);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
```

---

### `/api/customer/*` - Customer Routes

#### customer/index.js (Main Router)
```javascript
const express = require('express');
const router = express.Router();
const { isCustomer } = require('../../middlewares/auth.middleware');

// Apply customer auth to all routes
router.use(isCustomer);

// Sub-routes
router.use('/profile', require('./profile.routes'));
router.use('/addresses', require('./addresses.routes'));
router.use('/stores', require('./stores.routes'));
router.use('/products', require('./products.routes'));
router.use('/orders', require('./orders.routes'));
router.use('/tracking', require('./tracking.routes'));
router.use('/notifications', require('./notifications.routes'));

module.exports = router;
```

#### customer/profile.routes.js
```javascript
const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/customer/profile.controller');

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

module.exports = router;
```

#### customer/orders.routes.js
```javascript
const express = require('express');
const router = express.Router();
const ordersController = require('../../controllers/customer/orders.controller');

router.post('/', ordersController.createOrder);
router.get('/', ordersController.getMyOrders);
router.get('/:orderId', ordersController.getOrderDetails);
router.patch('/:orderId/cancel', ordersController.cancelOrder);
router.post('/:orderId/reorder', ordersController.reorder);

module.exports = router;
```

---

### `/api/store/*` - Store Owner Routes

#### store/index.js
```javascript
const express = require('express');
const router = express.Router();
const { isStoreOwner } = require('../../middlewares/auth.middleware');

router.use(isStoreOwner);

router.use('/profile', require('./profile.routes'));
router.use('/my-store', require('./store.routes'));
router.use('/products', require('./products.routes'));
router.use('/orders', require('./orders.routes'));
router.use('/statistics', require('./statistics.routes'));
router.use('/notifications', require('./notifications.routes'));

module.exports = router;
```

#### store/products.routes.js
```javascript
const express = require('express');
const router = express.Router();
const productsController = require('../../controllers/store/products.controller');
const uploadMiddleware = require('../../middlewares/upload.middleware');

router.get('/', productsController.getMyProducts);
router.post('/', uploadMiddleware.single('image'), productsController.addProduct);
router.put('/:productId', productsController.updateProduct);
router.put('/:productId/image', uploadMiddleware.single('image'), productsController.updateProductImage);
router.patch('/:productId/toggle-availability', productsController.toggleAvailability);
router.delete('/:productId', productsController.deleteProduct);

module.exports = router;
```

---

### `/api/driver/*` - Driver Routes

#### driver/index.js
```javascript
const express = require('express');
const router = express.Router();
const { isDriver } = require('../../middlewares/auth.middleware');

router.use(isDriver);

router.use('/profile', require('./profile.routes'));
router.use('/orders', require('./orders.routes'));
router.use('/tracking', require('./tracking.routes'));
router.use('/earnings', require('./earnings.routes'));
router.use('/notifications', require('./notifications.routes'));

module.exports = router;
```

#### driver/orders.routes.js
```javascript
const express = require('express');
const router = express.Router();
const ordersController = require('../../controllers/driver/orders.controller');

router.get('/available', ordersController.getAvailableOrders);
router.post('/:orderId/accept', ordersController.acceptOrder);
router.get('/active', ordersController.getActiveOrder);
router.patch('/:orderId/status', ordersController.updateOrderStatus);
router.get('/:orderId', ordersController.getOrderDetails);
router.get('/history', ordersController.getOrderHistory);

module.exports = router;
```

---

## 🔐 Middleware Updates

### auth.middleware.js
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StoreOwner = require('../models/StoreOwner');
const Driver = require('../models/Driver');

// Base auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'يجب تسجيل الدخول' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token غير صالح' });
  }
};

// Customer-only middleware
const isCustomer = async (req, res, next) => {
  await authMiddleware(req, res, async () => {
    if (req.userRole !== 'customer') {
      return res.status(403).json({ success: false, message: 'غير مصرح لك بالوصول' });
    }
    
    const user = await User.findById(req.userId);
    if (!user || !user.isActive) {
      return res.status(403).json({ success: false, message: 'الحساب غير نشط' });
    }
    
    req.user = user;
    next();
  });
};

// Store Owner-only middleware
const isStoreOwner = async (req, res, next) => {
  await authMiddleware(req, res, async () => {
    if (req.userRole !== 'store') {
      return res.status(403).json({ success: false, message: 'غير مصرح لك بالوصول' });
    }
    
    const owner = await StoreOwner.findById(req.userId).populate('storeId');
    if (!owner || !owner.isActive) {
      return res.status(403).json({ success: false, message: 'الحساب غير نشط' });
    }
    
    req.owner = owner;
    req.storeId = owner.storeId;
    next();
  });
};

// Driver-only middleware
const isDriver = async (req, res, next) => {
  await authMiddleware(req, res, async () => {
    if (req.userRole !== 'driver') {
      return res.status(403).json({ success: false, message: 'غير مصرح لك بالوصول' });
    }
    
    const driver = await Driver.findById(req.userId);
    if (!driver || !driver.isActive) {
      return res.status(403).json({ success: false, message: 'الحساب غير نشط' });
    }
    
    req.driver = driver;
    next();
  });
};

module.exports = {
  authMiddleware,
  isCustomer,
  isStoreOwner,
  isDriver
};
```

---

## 📝 Main App Router (app.js)

```javascript
const express = require('express');
const app = express();

// ... middleware setup (cors, helmet, etc.)

// Public routes
app.use('/api/health', (req, res) => res.json({ success: true, message: 'API is running' }));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/upload', require('./routes/upload.routes'));

// Auth routes
app.use('/api/auth', require('./routes/auth.routes'));

// User-specific routes
app.use('/api/customer', require('./routes/customer'));
app.use('/api/store', require('./routes/store'));
app.use('/api/driver', require('./routes/driver'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(require('./middlewares/error.middleware'));

module.exports = app;
```

---

## 📊 API Structure Summary

```
/api
├── /health                    (Public)
├── /categories                (Public)
├── /upload                    (Protected - All users)
│
├── /auth                      (Public + Protected)
│   ├── POST /customer/register
│   ├── POST /store/register
│   ├── POST /driver/register
│   ├── POST /login
│   └── GET  /me
│
├── /customer                  (Customer Only)
│   ├── /profile
│   ├── /addresses
│   ├── /stores
│   ├── /products
│   ├── /orders
│   ├── /tracking
│   └── /notifications
│
├── /store                     (Store Owner Only)
│   ├── /profile
│   ├── /my-store
│   ├── /products
│   ├── /orders
│   ├── /statistics
│   └── /notifications
│
└── /driver                    (Driver Only)
    ├── /profile
    ├── /orders
    ├── /tracking
    ├── /earnings
    └── /notifications
```

---

### 📍 **Notification Routes** (`/api/notifications`)

#### 1. Get My Notifications
```
GET /api/notifications?page=1&limit=20&unreadOnly=false
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { notifications, unreadCount, pagination }, message }
```

#### 2. Mark Notification as Read
```
PATCH /api/notifications/:notificationId/read
Headers: { Authorization: 'Bearer {token}' }
Response: { success, message }
```

#### 3. Mark All as Read
```
PATCH /api/notifications/read-all
Headers: { Authorization: 'Bearer {token}' }
Response: { success, message }
```

#### 4. Delete Notification
```
DELETE /api/notifications/:notificationId
Headers: { Authorization: 'Bearer {token}' }
Response: { success, message }
```

#### 5. Update FCM Token
```
POST /api/notifications/update-token
Headers: { Authorization: 'Bearer {token}' }
Body: { fcmToken }
Response: { success, message }
```

---

### 📍 **Real-Time Tracking Routes** (`/api/tracking`)

#### 1. Get Order Live Tracking (Customer/Store Owner)
```
GET /api/tracking/order/:orderId
Headers: { Authorization: 'Bearer {token}' }
Response: { 
  success, 
  data: { 
    order: { id, orderNumber, status, customerAddress },
    driver: { id, name, phone, currentLocation, lastUpdate },
    store: { id, name, address, location },
    customer: { address, location },
    eta: { distance, estimatedTime }
  }, 
  message 
}
```

#### 2. Get Driver Current Location (Customer - during active delivery)
```
GET /api/tracking/driver/:driverId
Headers: { Authorization: 'Bearer {token}' }
Response: { 
  success, 
  data: { 
    driverId, 
    name, 
    currentLocation: { lat, lng }, 
    lastUpdate 
  }, 
  message 
}
```

#### 3. Update Driver Location (Driver App - called every 5-10 seconds)
```
PATCH /api/tracking/driver/location
Headers: { Authorization: 'Bearer {token}' }
Body: { lat, lng }
Response: { success, message }
```

#### 4. Get Route Information
```
POST /api/tracking/route
Headers: { Authorization: 'Bearer {token}' }
Body: { 
  origin: { lat, lng }, 
  destination: { lat, lng } 
}
Response: { 
  success, 
  data: { 
    distance, 
    estimatedTime, 
    route: [] // array of coordinates for drawing route
  }, 
  message 
}
```

---

## 📋 Technical Requirements

### Core Technologies:
- **Framework**: Express.js (latest)
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **File Upload**: Multer + Cloudinary
- **Environment Variables**: dotenv
- **Security**: helmet, cors, express-rate-limit
- **Deployment**: Vercel (Serverless)
- **API Documentation**: Comments + Postman Collection

### Project Structure:
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

---

## 🗄️ Database Models (MongoDB Schemas)

### 1. User Model (Customer)
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  avatar: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  fcmToken: { type: String, default: null }, // للـ notifications
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 2. StoreOwner Model
```javascript
const storeOwnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  isActive: { type: Boolean, default: true },
  fcmToken: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 3. Store Model
```javascript
const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreOwner', required: true },
  image: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String, default: '' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  isOpen: { type: Boolean, default: true },
  deliveryTime: { type: String, default: '20-30 دقيقة' },
  deliveryFee: { type: Number, default: 10 },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  villageId: { type: String, required: true },
  workingHours: {
    from: { type: String, default: '08:00' },
    to: { type: String, default: '23:00' }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index للبحث الجغرافي
storeSchema.index({ coordinates: '2dsphere' });
```

### 4. Product Model
```javascript
const productSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  categoryId: { type: String, required: true }, // product subcategory
  description: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  soldCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index للبحث السريع
productSchema.index({ storeId: 1, isAvailable: 1 });
productSchema.index({ name: 'text' }); // للبحث النصي
```

### 5. Order Model
```javascript
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true }, // ORD-123456
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String }
  }],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'confirmed', 'picked_up', 'on_way', 'delivered', 'cancelled'],
    default: 'pending'
  },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
  driverAssignedAt: { type: Date, default: null },
  pickedUpAt: { type: Date, default: null },
  deliveredAt: { type: Date, default: null },
  address: {
    details: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'vodafone_cash', 'visa'],
    required: true
  },
  notes: { type: String, default: '' },
  timeline: [{
    status: { type: String, required: true },
    time: { type: Date, default: Date.now },
    label: { type: String }
  }],
  cancelReason: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index للاستعلامات السريعة
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ storeId: 1, status: 1, createdAt: -1 });
```

### 6. Address Model
```javascript
const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  details: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
```

### 7. Category Model
```javascript
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  nameEn: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
```

### 8. Driver Model
```javascript
const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  avatar: { type: String, default: null },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  vehicleType: { 
    type: String, 
    enum: ['motorcycle', 'car', 'tuktuk'],
    required: true 
  },
  vehicleNumber: { type: String, required: true },
  isAvailable: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false }, // admin activation
  coordinates: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  lastLocationUpdate: { type: Date, default: Date.now },
  documents: {
    nationalId: { type: String, default: null },
    drivingLicense: { type: String, default: null },
    isVerified: { type: Boolean, default: false }
  },
  fcmToken: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index للبحث الجغرافي
driverSchema.index({ coordinates: '2dsphere' });
driverSchema.index({ isAvailable: 1, isActive: 1 });
```

### 9. Notification Model
```javascript
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'userType' },
  userType: { type: String, enum: ['User', 'StoreOwner', 'Driver'], required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['order_new', 'order_accepted', 'order_confirmed', 'order_picked_up', 'order_on_way', 'order_delivered', 'order_cancelled', 'general'],
    required: true 
  },
  data: { type: mongoose.Schema.Types.Mixed, default: {} }, // extra data like orderId
  isRead: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now },
  readAt: { type: Date, default: null }
});

notificationSchema.index({ userId: 1, isRead: 1, sentAt: -1 });
```

---

## 🔔 Push Notifications System (Firebase Cloud Messaging)

### Firebase Admin SDK Setup:

#### 1. Firebase Configuration (config/firebase.js)
```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
```

#### 2. Notification Service (services/notification.service.js)
```javascript
const admin = require('../config/firebase');
const Notification = require('../models/Notification');

class NotificationService {
  
  // Send to single device
  async sendToDevice(fcmToken, title, body, data = {}) {
    try {
      const message = {
        notification: { title, body },
        data: { ...data },
        token: fcmToken,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'orders'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };
      
      const response = await admin.messaging().send(message);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('FCM Send Error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Send to multiple devices
  async sendToMultipleDevices(fcmTokens, title, body, data = {}) {
    try {
      const message = {
        notification: { title, body },
        data: { ...data },
        tokens: fcmTokens,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'orders'
          }
        }
      };
      
      const response = await admin.messaging().sendMulticast(message);
      return { success: true, successCount: response.successCount };
    } catch (error) {
      console.error('FCM Multicast Error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Log notification in database
  async logNotification(userId, userType, title, body, type, data = {}) {
    try {
      const notification = await Notification.create({
        userId,
        userType,
        title,
        body,
        type,
        data
      });
      return notification;
    } catch (error) {
      console.error('Log Notification Error:', error);
      return null;
    }
  }
  
  // Send and Log
  async sendAndLog(fcmToken, userId, userType, title, body, type, data = {}) {
    // Send push notification
    const sendResult = await this.sendToDevice(fcmToken, title, body, data);
    
    // Log in database
    await this.logNotification(userId, userType, title, body, type, data);
    
    return sendResult;
  }
}

module.exports = new NotificationService();
```

#### 3. Notification Helpers for Different Events:
```javascript
// Order Notifications
async function notifyNewOrder(order) {
  // Notify Store Owner
  const storeOwner = await StoreOwner.findOne({ storeId: order.storeId });
  if (storeOwner?.fcmToken) {
    await NotificationService.sendAndLog(
      storeOwner.fcmToken,
      storeOwner._id,
      'StoreOwner',
      'طلب جديد! 🛎️',
      `طلب جديد برقم ${order.orderNumber} بقيمة ${order.total} جنيه`,
      'order_new',
      { orderId: order._id.toString(), orderNumber: order.orderNumber }
    );
  }
  
  // Notify Available Drivers
  const availableDrivers = await Driver.find({ 
    isAvailable: true, 
    isActive: true,
    fcmToken: { $ne: null }
  });
  
  if (availableDrivers.length > 0) {
    const tokens = availableDrivers.map(d => d.fcmToken);
    await NotificationService.sendToMultipleDevices(
      tokens,
      'طلب جديد متاح! 🚗',
      `طلب توصيل متاح بقيمة ${order.deliveryFee} جنيه`,
      { orderId: order._id.toString(), orderNumber: order.orderNumber }
    );
  }
}

async function notifyOrderAccepted(order) {
  // Notify Customer
  const user = await User.findById(order.userId);
  if (user?.fcmToken) {
    await NotificationService.sendAndLog(
      user.fcmToken,
      user._id,
      'User',
      'تم قبول طلبك! ✅',
      `السائق ${order.driverName} قبل طلبك وفي الطريق للمحل`,
      'order_accepted',
      { orderId: order._id.toString() }
    );
  }
}

async function notifyOrderConfirmed(order) {
  // Notify Customer & Driver
  const user = await User.findById(order.userId);
  const driver = await Driver.findById(order.driverId);
  
  if (user?.fcmToken) {
    await NotificationService.sendAndLog(
      user.fcmToken,
      user._id,
      'User',
      'المحل أكّد طلبك! 🎉',
      'المحل يحضر طلبك الآن',
      'order_confirmed',
      { orderId: order._id.toString() }
    );
  }
  
  if (driver?.fcmToken) {
    await NotificationService.sendAndLog(
      driver.fcmToken,
      driver._id,
      'Driver',
      'المحل أكّد الطلب ✅',
      'يمكنك الآن استلام الطلب من المحل',
      'order_confirmed',
      { orderId: order._id.toString() }
    );
  }
}

async function notifyOrderPickedUp(order) {
  // Notify Customer
  const user = await User.findById(order.userId);
  if (user?.fcmToken) {
    await NotificationService.sendAndLog(
      user.fcmToken,
      user._id,
      'User',
      'السائق استلم طلبك! 📦',
      `${order.driverName} استلم طلبك وفي الطريق إليك`,
      'order_picked_up',
      { orderId: order._id.toString() }
    );
  }
}

async function notifyOrderOnWay(order) {
  // Notify Customer
  const user = await User.findById(order.userId);
  if (user?.fcmToken) {
    await NotificationService.sendAndLog(
      user.fcmToken,
      user._id,
      'User',
      'السائق في الطريق! 🚗',
      'طلبك سيصل خلال دقائق',
      'order_on_way',
      { orderId: order._id.toString() }
    );
  }
}

async function notifyOrderDelivered(order) {
  // Notify Customer, Store Owner, Driver
  const user = await User.findById(order.userId);
  const storeOwner = await StoreOwner.findOne({ storeId: order.storeId });
  
  if (user?.fcmToken) {
    await NotificationService.sendAndLog(
      user.fcmToken,
      user._id,
      'User',
      'تم التوصيل بنجاح! 🎉',
      'نتمنى أن تكون راضياً عن الخدمة',
      'order_delivered',
      { orderId: order._id.toString() }
    );
  }
  
  if (storeOwner?.fcmToken) {
    await NotificationService.sendAndLog(
      storeOwner.fcmToken,
      storeOwner._id,
      'StoreOwner',
      'تم توصيل الطلب ✅',
      `تم توصيل طلب ${order.orderNumber} بنجاح`,
      'order_delivered',
      { orderId: order._id.toString() }
    );
  }
}

module.exports = {
  notifyNewOrder,
  notifyOrderAccepted,
  notifyOrderConfirmed,
  notifyOrderPickedUp,
  notifyOrderOnWay,
  notifyOrderDelivered
};
```

---

## 📍 Real-Time Driver Tracking System

### Tracking Service (services/tracking.service.js)
```javascript
class TrackingService {
  
  // Update driver location
  async updateDriverLocation(driverId, lat, lng) {
    try {
      const driver = await Driver.findByIdAndUpdate(
        driverId,
        {
          coordinates: { lat, lng },
          lastLocationUpdate: new Date()
        },
        { new: true }
      );
      
      return driver;
    } catch (error) {
      console.error('Update Location Error:', error);
      return null;
    }
  }
  
  // Get driver current location
  async getDriverLocation(driverId) {
    try {
      const driver = await Driver.findById(driverId)
        .select('coordinates lastLocationUpdate name');
      return driver;
    } catch (error) {
      console.error('Get Location Error:', error);
      return null;
    }
  }
  
  // Get active order with driver location
  async getOrderTracking(orderId) {
    try {
      const order = await Order.findById(orderId)
        .populate('driverId', 'name phone coordinates lastLocationUpdate')
        .populate('storeId', 'name address coordinates');
      
      if (!order) return null;
      
      return {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          customerAddress: order.address
        },
        driver: order.driverId ? {
          id: order.driverId._id,
          name: order.driverId.name,
          phone: order.driverId.phone,
          currentLocation: order.driverId.coordinates,
          lastUpdate: order.driverId.lastLocationUpdate
        } : null,
        store: {
          id: order.storeId._id,
          name: order.storeId.name,
          address: order.storeId.address,
          location: order.storeId.coordinates
        },
        customer: {
          address: order.address.details,
          location: order.address.coordinates
        }
      };
    } catch (error) {
      console.error('Get Order Tracking Error:', error);
      return null;
    }
  }
  
  // Calculate ETA (Estimated Time of Arrival)
  calculateETA(driverLocation, destinationLocation, avgSpeed = 30) {
    // avgSpeed in km/h (default 30 km/h for cities/villages)
    const distance = this.calculateDistance(
      driverLocation.lat,
      driverLocation.lng,
      destinationLocation.lat,
      destinationLocation.lng
    );
    
    const timeInHours = distance / avgSpeed;
    const timeInMinutes = Math.ceil(timeInHours * 60);
    
    return {
      distance: distance.toFixed(2), // km
      estimatedTime: timeInMinutes // minutes
    };
  }
  
  // Haversine formula for distance
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }
  
  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }
}

module.exports = new TrackingService();
```

---

## 🔐 Authentication & Authorization

### JWT Strategy:
```javascript
// Access Token: عمره 7 أيام
// Refresh Token: عمره 30 يوم (optional)

// Payload:
{
  userId: '...',
  role: 'customer' | 'store_owner',
  phone: '...'
}
```

### Middleware:
```javascript
// auth.middleware.js
- verifyToken: التحقق من الـ JWT
- isCustomer: التحقق من أن المستخدم عميل
- isStoreOwner: التحقق من أن المستخدم صاحب محل
```

---

## 🛣️ API Endpoints Specification (Organized by User Type)

---

## 🔐 **PUBLIC ROUTES** (`/api`)

### Health Check
```
GET /api/health
Response: { success: true, message: "API is running" }
```

### Categories (Public)
```
GET /api/categories
Response: { success, data: { categories }, message }
```

---

## 🔓 **AUTH ROUTES** (`/api/auth`)

### Register Customer
```
POST /api/auth/customer/register
Body: { name, phone, password }
Response: { success, data: { user, token }, message }
```

### Register Store Owner
```
POST /api/auth/store/register
Body: { name, phone, password, storeId }
Response: { success, data: { owner, token }, message }
```

### Register Driver
```
POST /api/auth/driver/register
Body: FormData { 
  name, phone, password, 
  vehicleType, vehicleNumber,
  nationalId: File, drivingLicense: File 
}
Response: { success, data: { driver }, message: 'سيتم مراجعة طلبك خلال 24 ساعة' }
```

### Login (Unified)
```
POST /api/auth/login
Body: { phone, password, role: 'customer' | 'store' | 'driver' }
Response: { success, data: { user/owner/driver, token, role }, message }
```

### Get Current User
```
GET /api/auth/me
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { user, role }, message }
```

---

## 👤 **CUSTOMER ROUTES** (`/api/customer`)

### Profile Management

#### Get Profile
```
GET /api/customer/profile
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { user }, message }
```

#### Update Profile
```
PUT /api/customer/profile
Headers: { Authorization: 'Bearer {token}' }
Body: { name, avatar }
Response: { success, data: { user }, message }
```

---

### Addresses

#### Get My Addresses
```
GET /api/customer/addresses
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { addresses }, message }
```

#### Add Address
```
POST /api/customer/addresses
Headers: { Authorization: 'Bearer {token}' }
Body: { type, details, coordinates: { lat, lng }, isDefault }
Response: { success, data: { address }, message }
```

#### Update Address
```
PUT /api/customer/addresses/:addressId
Headers: { Authorization: 'Bearer {token}' }
Body: { type, details, coordinates, isDefault }
Response: { success, data: { address }, message }
```

#### Delete Address
```
DELETE /api/customer/addresses/:addressId
Headers: { Authorization: 'Bearer {token}' }
Response: { success, message }
```

---

### Stores & Products

#### Get Nearby Stores
```
GET /api/customer/stores/nearby?lat=31.1107&lng=30.9388&radius=10&categoryId=cat1
Headers: { Authorization: 'Bearer {token}' } (Optional)
Response: { success, data: { stores }, message }
```

#### Get Store Details
```
GET /api/customer/stores/:storeId
Response: { success, data: { store }, message }
```

#### Search Stores
```
GET /api/customer/stores/search?query=بقالة&villageId=v1
Response: { success, data: { stores }, message }
```

#### Get Store Products
```
GET /api/customer/stores/:storeId/products?categoryId=cat1_sub1&search=أرز
Response: { success, data: { products }, message }
```

#### Get Product Details
```
GET /api/customer/products/:productId
Response: { success, data: { product }, message }
```

---

### Orders

#### Create Order
```
POST /api/customer/orders
Headers: { Authorization: 'Bearer {token}' }
Body: {
  storeId,
  items: [{ productId, quantity }],
  address: { details, coordinates },
  paymentMethod,
  notes
}
Response: { success, data: { order }, message }
```

#### Get My Orders
```
GET /api/customer/orders?status=pending&page=1&limit=20
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { orders, pagination }, message }
```

#### Get Order Details
```
GET /api/customer/orders/:orderId
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { order }, message }
```

#### Cancel Order
```
PATCH /api/customer/orders/:orderId/cancel
Headers: { Authorization: 'Bearer {token}' }
Body: { cancelReason }
Response: { success, data: { order }, message }
```

#### Reorder
```
POST /api/customer/orders/:orderId/reorder
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { newOrder }, message }
```

---

### Tracking

#### Track Order (Real-time)
```
GET /api/customer/tracking/:orderId
Headers: { Authorization: 'Bearer {token}' }
Response: { 
  success, 
  data: { 
    order,
    driver: { id, name, phone, currentLocation, lastUpdate },
    store: { id, name, location },
    customer: { location },
    eta: { distance, estimatedTime }
  }, 
  message 
}
```

#### Get Driver Location
```
GET /api/customer/tracking/driver/:driverId
Headers: { Authorization: 'Bearer {token}' }
Response: { 
  success, 
  data: { driverId, name, currentLocation, lastUpdate }, 
  message 
}
```

---

### Notifications

#### Get My Notifications
```
GET /api/customer/notifications?page=1&limit=20&unreadOnly=false
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { notifications, unreadCount, pagination }, message }
```

#### Mark as Read
```
PATCH /api/customer/notifications/:notificationId/read
Headers: { Authorization: 'Bearer {token}' }
Response: { success, message }
```

#### Mark All as Read
```
PATCH /api/customer/notifications/read-all
Headers: { Authorization: 'Bearer {token}' }
Response: { success, message }
```

#### Update FCM Token
```
POST /api/customer/notifications/token
Headers: { Authorization: 'Bearer {token}' }
Body: { fcmToken }
Response: { success, message }
```

---

## 🏪 **STORE OWNER ROUTES** (`/api/store`)

### Profile Management

#### Get Profile
```
GET /api/store/profile
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { owner, store }, message }
```

#### Update Profile
```
PUT /api/store/profile
Headers: { Authorization: 'Bearer {token}' }
Body: { name }
Response: { success, data: { owner }, message }
```

---

### Store Management

#### Get My Store
```
GET /api/store/my-store
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { store }, message }
```

#### Update Store
```
PUT /api/store/my-store
Headers: { Authorization: 'Bearer {token}' }
Body: { name, description, phone, address, workingHours }
Response: { success, data: { store }, message }
```

#### Update Store Image
```
PUT /api/store/my-store/image
Headers: { Authorization: 'Bearer {token}' }
Body: FormData { image: File }
Response: { success, data: { store }, message }
```

#### Toggle Store Status
```
PATCH /api/store/my-store/toggle-status
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { isOpen }, message }
```

---

### Products Management

#### Get My Products
```
GET /api/store/products?categoryId=cat1_sub1&search=أرز&page=1&limit=20
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { products, pagination }, message }
```

#### Add Product
```
POST /api/store/products
Headers: { Authorization: 'Bearer {token}' }
Body: FormData { name, price, categoryId, description, image: File, isAvailable }
Response: { success, data: { product }, message }
```

#### Update Product
```
PUT /api/store/products/:productId
Headers: { Authorization: 'Bearer {token}' }
Body: { name, price, categoryId, description, isAvailable }
Response: { success, data: { product }, message }
```

#### Update Product Image
```
PUT /api/store/products/:productId/image
Headers: { Authorization: 'Bearer {token}' }
Body: FormData { image: File }
Response: { success, data: { product }, message }
```

#### Toggle Product Availability
```
PATCH /api/store/products/:productId/toggle-availability
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { product }, message }
```

#### Delete Product
```
DELETE /api/store/products/:productId
Headers: { Authorization: 'Bearer {token}' }
Response: { success, message }
```

---

### Orders Management

#### Get Store Orders
```
GET /api/store/orders?status=pending&page=1&limit=20
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { orders, pagination }, message }
```

#### Get Order Details
```
GET /api/store/orders/:orderId
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { order }, message }
```

#### Confirm Order
```
PATCH /api/store/orders/:orderId/confirm
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { order }, message }
```

#### Cancel Order
```
PATCH /api/store/orders/:orderId/cancel
Headers: { Authorization: 'Bearer {token}' }
Body: { cancelReason }
Response: { success, data: { order }, message }
```

---

### Statistics

#### Get Store Statistics
```
GET /api/store/statistics?period=today|week|month
Headers: { Authorization: 'Bearer {token}' }
Response: { 
  success, 
  data: { 
    totalOrders, 
    totalSales, 
    avgOrderValue, 
    completedOrders,
    cancelledOrders,
    topProducts: []
  }, 
  message 
}
```

---

### Notifications

#### Get My Notifications
```
GET /api/store/notifications?page=1&limit=20
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { notifications, unreadCount }, message }
```

#### Mark as Read
```
PATCH /api/store/notifications/:notificationId/read
Headers: { Authorization: 'Bearer {token}' }
Response: { success, message }
```

#### Update FCM Token
```
POST /api/store/notifications/token
Headers: { Authorization: 'Bearer {token}' }
Body: { fcmToken }
Response: { success, message }
```

---

## 🚗 **DRIVER ROUTES** (`/api/driver`)

### Profile Management

#### Get Profile
```
GET /api/driver/profile
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { driver }, message }
```

#### Update Profile
```
PUT /api/driver/profile
Headers: { Authorization: 'Bearer {token}' }
Body: { name, avatar, vehicleType, vehicleNumber }
Response: { success, data: { driver }, message }
```

#### Toggle Availability
```
PATCH /api/driver/toggle-availability
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { isAvailable }, message }
```

---

### Orders Management

#### Get Available Orders
```
GET /api/driver/orders/available?lat=31.1110&lng=30.9390&radius=10
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { orders }, message }
```

#### Accept Order
```
POST /api/driver/orders/:orderId/accept
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { order }, message }
```

#### Get Active Order
```
GET /api/driver/orders/active
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { order }, message }
```

#### Update Order Status
```
PATCH /api/driver/orders/:orderId/status
Headers: { Authorization: 'Bearer {token}' }
Body: { status: 'picked_up' | 'on_way' | 'delivered' }
Response: { success, data: { order }, message }
```

#### Get Order Details
```
GET /api/driver/orders/:orderId
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { order }, message }
```

#### Get Order History
```
GET /api/driver/orders/history?period=today|week|month&page=1&limit=20
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { orders, pagination }, message }
```

---

### Tracking

#### Update My Location
```
PATCH /api/driver/tracking/location
Headers: { Authorization: 'Bearer {token}' }
Body: { lat, lng }
Response: { success, message }
```

#### Get Order Route Info
```
GET /api/driver/tracking/route/:orderId
Headers: { Authorization: 'Bearer {token}' }
Response: { 
  success, 
  data: { 
    storeLocation,
    customerLocation,
    myLocation,
    distanceToStore,
    distanceToCustomer,
    totalDistance
  }, 
  message 
}
```

---

### Earnings

#### Get Earnings Summary
```
GET /api/driver/earnings?period=today|week|month|year
Headers: { Authorization: 'Bearer {token}' }
Response: { 
  success, 
  data: { 
    totalEarnings, 
    totalOrders,
    avgOrderValue,
    highestOrder,
    lowestOrder,
    dailyBreakdown: []
  }, 
  message 
}
```

#### Get Statistics
```
GET /api/driver/statistics
Headers: { Authorization: 'Bearer {token}' }
Response: { 
  success, 
  data: { 
    totalOrders, 
    totalEarnings,
    rating,
    totalReviews,
    acceptanceRate,
    completionRate
  }, 
  message 
}
```

---

### Notifications

#### Get My Notifications
```
GET /api/driver/notifications?page=1&limit=20
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { notifications, unreadCount }, message }
```

#### Mark as Read
```
PATCH /api/driver/notifications/:notificationId/read
Headers: { Authorization: 'Bearer {token}' }
Response: { success, message }
```

#### Update FCM Token
```
POST /api/driver/notifications/token
Headers: { Authorization: 'Bearer {token}' }
Body: { fcmToken }
Response: { success, message }
```

---

#### 1. Register Customer
```
POST /api/auth/register/customer
Body: { name, phone, password }
Response: { success, data: { user, token }, message }
```

#### 2. Register Store Owner
```
POST /api/auth/register/store-owner
Body: { name, phone, password, storeId }
Response: { success, data: { owner, token }, message }
```

#### 3. Login
```
POST /api/auth/login
Body: { phone, password, role: 'customer' | 'store_owner' }
Response: { success, data: { user/owner, token }, message }
```

#### 4. Get Current User
```
GET /api/auth/me
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { user }, message }
```

---

### 📍 **Customer Routes** (`/api/customers`)

#### 1. Update Profile
```
PUT /api/customers/profile
Headers: { Authorization: 'Bearer {token}' }
Body: { name, avatar }
Response: { success, data: { user }, message }
```

#### 2. Get My Orders
```
GET /api/customers/orders?status=pending&page=1&limit=20
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { orders, pagination }, message }
```

#### 3. Add Address
```
POST /api/customers/addresses
Headers: { Authorization: 'Bearer {token}' }
Body: { type, details, coordinates: { lat, lng }, isDefault }
Response: { success, data: { address }, message }
```

#### 4. Get My Addresses
```
GET /api/customers/addresses
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { addresses }, message }
```

#### 5. Delete Address
```
DELETE /api/customers/addresses/:addressId
Headers: { Authorization: 'Bearer {token}' }
Response: { success, message }
```

---

### 📍 **Store Routes** (`/api/stores`)

#### 1. Get Nearby Stores
```
GET /api/stores/nearby?lat=31.1107&lng=30.9388&radius=10&categoryId=cat1
Response: { success, data: { stores }, message }
```

#### 2. Get Store Details
```
GET /api/stores/:storeId
Response: { success, data: { store }, message }
```

#### 3. Search Stores
```
GET /api/stores/search?query=بقالة&villageId=v1
Response: { success, data: { stores }, message }
```

#### 4. Update Store (Store Owner)
```
PUT /api/stores/:storeId
Headers: { Authorization: 'Bearer {token}' }
Body: { name, description, phone, address, workingHours, isOpen }
Response: { success, data: { store }, message }
```

#### 5. Update Store Image (Store Owner)
```
PUT /api/stores/:storeId/image
Headers: { Authorization: 'Bearer {token}' }
Body: FormData { image: File }
Response: { success, data: { store }, message }
```

#### 6. Toggle Store Status (Store Owner)
```
PATCH /api/stores/:storeId/toggle-status
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { store }, message }
```

#### 7. Get Store Statistics (Store Owner)
```
GET /api/stores/:storeId/stats?period=today|week|month
Headers: { Authorization: 'Bearer {token}' }
Response: { 
  success, 
  data: { 
    totalOrders, 
    totalSales, 
    avgOrderValue, 
    completedOrders,
    cancelledOrders 
  }, 
  message 
}
```

---

### 📍 **Product Routes** (`/api/products`)

#### 1. Get Store Products
```
GET /api/products?storeId=123&categoryId=cat1_sub1&search=أرز&page=1&limit=20
Response: { success, data: { products, pagination }, message }
```

#### 2. Get Product Details
```
GET /api/products/:productId
Response: { success, data: { product }, message }
```

#### 3. Add Product (Store Owner)
```
POST /api/products
Headers: { Authorization: 'Bearer {token}' }
Body: FormData { name, price, categoryId, description, image: File, isAvailable }
Response: { success, data: { product }, message }
```

#### 4. Update Product (Store Owner)
```
PUT /api/products/:productId
Headers: { Authorization: 'Bearer {token}' }
Body: { name, price, categoryId, description, isAvailable }
Response: { success, data: { product }, message }
```

#### 5. Update Product Image (Store Owner)
```
PUT /api/products/:productId/image
Headers: { Authorization: 'Bearer {token}' }
Body: FormData { image: File }
Response: { success, data: { product }, message }
```

#### 6. Toggle Product Availability (Store Owner)
```
PATCH /api/products/:productId/toggle-availability
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { product }, message }
```

#### 7. Delete Product (Store Owner)
```
DELETE /api/products/:productId
Headers: { Authorization: 'Bearer {token}' }
Response: { success, message }
```

---

### 📍 **Order Routes** (`/api/orders`)

#### 1. Create Order (Customer)
```
POST /api/orders
Headers: { Authorization: 'Bearer {token}' }
Body: {
  storeId,
  items: [{ productId, quantity }],
  address: { details, coordinates },
  paymentMethod,
  notes
}
Response: { success, data: { order }, message }
```

#### 2. Get Order Details
```
GET /api/orders/:orderId
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { order }, message }
```

#### 3. Get Store Orders (Store Owner)
```
GET /api/orders/store/:storeId?status=pending&page=1&limit=20
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { orders, pagination }, message }
```

#### 4. Update Order Status (Store Owner)
```
PATCH /api/orders/:orderId/status
Headers: { Authorization: 'Bearer {token}' }
Body: { status: 'confirmed' | 'delivering' | 'delivered' | 'cancelled', cancelReason }
Response: { success, data: { order }, message }
```

#### 5. Cancel Order (Customer)
```
PATCH /api/orders/:orderId/cancel
Headers: { Authorization: 'Bearer {token}' }
Body: { cancelReason }
Response: { success, data: { order }, message }
```

#### 6. Reorder (Customer)
```
POST /api/orders/:orderId/reorder
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { newOrder }, message }
```

---

### 📍 **Category Routes** (`/api/categories`)

#### 1. Get All Categories
```
GET /api/categories
Response: { success, data: { categories }, message }
```

#### 2. Get Category Stores
```
GET /api/categories/:categoryId/stores?lat=31.1107&lng=30.9388
Response: { success, data: { stores }, message }
```

---

### 📍 **Upload Routes** (`/api/upload`)

#### 1. Upload Image
```
POST /api/upload/image
Headers: { Authorization: 'Bearer {token}' }
Body: FormData { image: File }
Response: { success, data: { imageUrl }, message }
```

---

### 📍 **Driver Routes** (`/api/drivers`)

#### 1. Register Driver
```
POST /api/drivers/register
Body: FormData { 
  name, phone, password, 
  vehicleType, vehicleNumber,
  nationalId: File, drivingLicense: File 
}
Response: { success, data: { driver }, message: 'سيتم مراجعة طلبك خلال 24 ساعة' }
```

#### 2. Login Driver
```
POST /api/drivers/login
Body: { phone, password }
Response: { success, data: { driver, token }, message }
```

#### 3. Get Driver Profile
```
GET /api/drivers/profile
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { driver }, message }
```

#### 4. Update Driver Profile
```
PUT /api/drivers/profile
Headers: { Authorization: 'Bearer {token}' }
Body: { name, avatar, vehicleType, vehicleNumber }
Response: { success, data: { driver }, message }
```

#### 5. Toggle Driver Availability
```
PATCH /api/drivers/toggle-availability
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { isAvailable }, message }
```

#### 6. Update Driver Location
```
PATCH /api/drivers/location
Headers: { Authorization: 'Bearer {token}' }
Body: { lat, lng }
Response: { success, message }
```

#### 7. Get Available Orders for Driver
```
GET /api/drivers/available-orders?lat=31.1110&lng=30.9390&radius=10
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { orders }, message }
```

#### 8. Accept Order
```
POST /api/drivers/orders/:orderId/accept
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { order }, message }
```

#### 9. Update Order Status (Driver)
```
PATCH /api/drivers/orders/:orderId/status
Headers: { Authorization: 'Bearer {token}' }
Body: { status: 'picked_up' | 'on_way' | 'delivered' }
Response: { success, data: { order }, message }
```

#### 10. Get Driver Active Order
```
GET /api/drivers/active-order
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { order }, message }
```

#### 11. Get Driver Order History
```
GET /api/drivers/order-history?period=today|week|month&page=1&limit=20
Headers: { Authorization: 'Bearer {token}' }
Response: { success, data: { orders, pagination }, message }
```

#### 12. Get Driver Earnings
```
GET /api/drivers/earnings?period=today|week|month|year
Headers: { Authorization: 'Bearer {token}' }
Response: { 
  success, 
  data: { 
    totalEarnings, 
    totalOrders,
    avgOrderValue,
    highestOrder,
    lowestOrder,
    dailyBreakdown: []
  }, 
  message 
}
```

#### 13. Get Driver Statistics
```
GET /api/drivers/statistics
Headers: { Authorization: 'Bearer {token}' }
Response: { 
  success, 
  data: { 
    totalOrders, 
    totalEarnings,
    rating,
    totalReviews,
    acceptanceRate,
    cancellationRate
  }, 
  message 
}
```

---

## 🔒 Security Features

### 1. Rate Limiting (Per User Type)
```javascript
// Auth routes: 5 requests/15 minutes
// Customer routes: 100 requests/15 minutes  
// Store routes: 200 requests/15 minutes
// Driver routes: 500 requests/15 minutes (higher for location updates)
```

### 2. Input Validation
```javascript
// استخدام Joi للـ validation
- Phone: Egyptian format (01xxxxxxxxx)
- Password: min 6 characters
- Price: positive number
- Coordinates: valid lat/lng
```

### 3. Security Headers
```javascript
// استخدام helmet
- XSS Protection
- Content Security Policy
- HSTS
```

### 4. CORS Configuration
```javascript
// السماح فقط للـ apps
const allowedOrigins = [
  'exp://192.168.x.x:19000', // Expo Dev
  'http://localhost:19006',   // Expo Web
  // Add production domains
];
```

---

## 📦 Utilities

### 1. Distance Calculator
```javascript
// utils/distance.js
function calculateDistance(lat1, lng1, lat2, lng2) {
  // Haversine formula
  // return distance in KM
}
```

### 2. Response Formatter
```javascript
// utils/response.js
function successResponse(res, data, message, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
}

function errorResponse(res, message, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    message
  });
}
```

### 3. JWT Helper
```javascript
// utils/jwt.js
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
```

---

## 🌱 Database Seeding

### Seeder Script
```javascript
// utils/seeders.js
// يعمل seed للبيانات الأساسية:
- Categories (7 فئات)
- Villages (5 قرى)
- Store Owners (5 تجار)
- Stores (5 محلات)
- Products (20-30 منتج)
- Sample Users (3-5 مستخدمين)
```

### Seed Command:
```bash
npm run seed
```

---

## ⚙️ Configuration Files

### 1. vercel.json
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

### 2. .env.example
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

### 3. package.json
```json
{
  "name": "delivery-api",
  "version": "1.0.0",
  "description": "Backend API for Egyptian Villages Delivery App",
  "main": "api/index.js",
  "scripts": {
    "dev": "nodemon api/index.js",
    "start": "node api/index.js",
    "seed": "node src/utils/seeders.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "joi": "^17.11.0",
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^1.41.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.0",
    "dotenv": "^16.3.1",
    "firebase-admin": "^12.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## ✅ Acceptance Criteria

### Functionality:
- [ ] جميع الـ endpoints تعمل بدون أخطاء
- [ ] Authentication & Authorization يعملان بشكل صحيح
- [ ] File upload يعمل على Cloudinary
- [ ] Database relationships صحيحة
- [ ] Validation شاملة لكل الـ inputs
- [ ] Error handling احترافي
- [ ] Rate limiting يعمل
- [ ] CORS مضبوط
- [ ] Seeder يعمل ويملأ البيانات الأساسية
- [ ] **Push Notifications تعمل (FCM)**
- [ ] **Real-time Location Tracking يعمل**
- [ ] **ETA Calculation دقيق**

### Security:
- [ ] Passwords مشفرة ببcrypt
- [ ] JWT tokens آمنة
- [ ] Security headers موجودة
- [ ] Input sanitization
- [ ] SQL/NoSQL injection protected

### Code Quality:
- [ ] Code منظم ونظيف
- [ ] Comments واضحة
- [ ] Error messages مفيدة
- [ ] Response format موحد
- [ ] Async/await مستخدمة بشكل صحيح

### Deployment:
- [ ] يعمل على Vercel بدون مشاكل
- [ ] Environment variables مضبوطة
- [ ] MongoDB Atlas متصل
- [ ] Cloudinary متصل

---

## 🚀 Deliverables

1. **كامل كود الـ Backend** مع الـ Structure المذكور
2. **README.md** يشرح:
   - كيفية الـ setup locally
   - Environment variables المطلوبة
   - كيفية الـ deployment على Vercel
   - API Documentation (Endpoints)
3. **Postman Collection** (optional but recommended)
4. **Seeder script** جاهز ويعمل
5. **كود جاهز للـ deployment**

---

## 💡 Important Notes

### For Vercel Deployment:
- استخدم **Serverless Functions**
- كل الـ routes تمر من خلال `api/index.js`
- استخدم MongoDB Atlas (لا تستخدم local MongoDB)
- Cloudinary للصور (لا تحفظ على الـ server)

### Best Practices:
- استخدم **async/await** في كل مكان
- Handle errors بشكل صحيح
- استخدم **try-catch** blocks
- Log errors بشكل واضح
- استخدم **Mongoose middleware** للتحديثات التلقائية
- Index الـ fields المهمة في MongoDB

### Performance:
- استخدم **pagination** في كل الـ lists
- استخدم **select** لتحديد الـ fields المطلوبة فقط
- استخدم **lean()** في Mongoose للـ read-only queries
- Cache الـ categories والبيانات الثابتة

### Testing:
- اختبر كل endpoint بـ Postman
- اختبر الـ authentication flow
- اختبر file upload
- اختبر error handling
- اختبر rate limiting

**ابدأ بإنشاء الـ Backend الكامل الآن! 🚀**