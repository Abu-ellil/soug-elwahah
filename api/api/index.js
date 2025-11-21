const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('../config/database');

// Import Socket.IO configuration (only initialize if needed)
const { initializeSocket } = require('../config/socket');

// Import scheduler
const DeliveryScheduler = require('../utils/scheduler');

// Import Swagger configuration
const { specs, swaggerUi, swaggerOptions } = require('../config/swagger');

// Import middleware
const errorHandler = require('../middleware/errorHandler');
const notFound = require('../middleware/notFound');

// Import routes with error handling
const authRoutes = require('../routes/auth');

// Handle routes with safe require to avoid crashes
let userRoutes;
try {
  userRoutes = require('../routes/users');
} catch (e) {
  console.warn('Users routes module not found, skipping users routes:', e.message);
  userRoutes = null;
}

// Import stores route with error handling
let storesRoutes;
try {
  storesRoutes = require('../routes/stores');
} catch (e) {
  console.warn('Stores routes module not found, skipping stores routes:', e.message);
  storesRoutes = null;
}

const adminRoutes = require('../routes/admin');
const customerRoutes = require('../routes/customer');
const driverRoutes = require('../routes/driver');
const productRoutes = require('../routes/products');
const serviceRoutes = require('../routes/services');
const storeRoutes = require('../routes/store');
const orderRoutes = require('../routes/orders');
const paymentRoutes = require('../routes/payment');
const messageRoutes = require('../routes/messages');
const reviewRoutes = require('../routes/reviews');
const notificationRoutes = require('../routes/notifications');
const categoryRoutes = require('../routes/categories');
const uploadRoutes = require('../routes/upload');
const testRoutes = require('../routes/test');
const deliveryRoutes = require('../routes/deliveries');

// Create Express app
const app = express();

// Connect to database with proper error handling for serverless
if (!global.mongooseConnection) {
  connectDB()
    .then(() => {
      global.mongooseConnection = true;
      console.log('✅ MongoDB Connected in serverless environment');
    })
    .catch((err) => {
      console.error('❌ Database connection failed in serverless:', err.message);
      // In serverless, we don't want to crash the function, just log the error
    });
}

// Trust proxy (important for Vercel deployment)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting - DISABLED for serverless (can cause issues)
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000, // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 250, // limit each IP to 100 requests per windowMs
//   message: {
//     success: false,
//     message: 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
 origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:8081',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:19006', // Expo dev server
      'https://your-frontend-domain.vercel.app',
      'http://192.168.1.4:8081', // Local IP for mobile devices
      'http://192.168.1.4:3000', // Local IP for mobile devices
      'http://192.168.1.4:3001', // Local IP for mobile devices
      'http://192.168.1.4:19006', // Local IP for Expo dev server
      'http://10.0.2.2:19006', // Android emulator to access host machine
      'http://10.0.2.2:8081', // Android emulator to access host machine
      'http://10.0.2.2:3000', // Android emulator to access host machine
      'http://10.0.2.2:3001', // Android emulator to access host machine
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('غير مسموح بالوصول من هذا المصدر'));
    }
 },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Cookie parsing middleware
app.use(cookieParser());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ElSoug API is running successfully! 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0'
  });
});

// API routes
const API_VERSION = process.env.API_VERSION || 'v1';

app.use(`/api/${API_VERSION}/auth`, authRoutes);
// Conditionally mount users routes only if available
if (userRoutes) { app.use(`/api/${API_VERSION}/users`, userRoutes); }
app.use(`/api/${API_VERSION}/customer`, customerRoutes);
app.use(`/api/${API_VERSION}/products`, productRoutes);
app.use(`/api/${API_VERSION}/services`, serviceRoutes);
// Conditionally mount stores routes only if available
if (storesRoutes) { app.use(`/api/${API_VERSION}/stores`, storesRoutes); }
app.use(`/api/${API_VERSION}/orders`, orderRoutes);
app.use(`/api/${API_VERSION}/payment`, paymentRoutes);
app.use(`/api/${API_VERSION}/messages`, messageRoutes);
app.use(`/api/${API_VERSION}/reviews`, reviewRoutes);
app.use(`/api/${API_VERSION}/notifications`, notificationRoutes);
app.use(`/api/${API_VERSION}/categories`, categoryRoutes);
app.use(`/api/${API_VERSION}/upload`, uploadRoutes);
app.use(`/api/${API_VERSION}/test`, testRoutes);
app.use(`/api/${API_VERSION}/drivers`, driverRoutes);
app.use(`/api/${API_VERSION}/deliveries`, deliveryRoutes);

// Mount admin routes
app.use(`/api/${API_VERSION}/admin`, adminRoutes);

// API Documentation with Swagger
app.use(`/api/${API_VERSION}/docs`, swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// Base API route
app.get(`/api/${API_VERSION}`, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ElSoug API - السوق المحلي 🇪🇬',
    version: '1.0.0',
    documentation: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/docs`,
    endpoints: {
      auth: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/auth`,
      users: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/users`,
      customer: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/customer`,
      products: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/products`,
      services: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/services`,
      stores: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/stores`,
      orders: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/orders`,
      payment: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/payment`,
      deliveries: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/deliveries`,
      drivers: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/drivers`,
      messages: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/messages`,
      reviews: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/reviews`,
      notifications: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/notifications`,
      categories: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/categories`,
      upload: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/upload`,
      admin: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/admin`
    },
    timestamp: new Date().toISOString()
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'مرحباً بك في ElSoug API - السوق المحلي للقرى المصرية 🇪🇬',
    documentation: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/docs`,
    health: `${req.protocol}://${req.get('host')}/health`,
    version: '1.0.0',
    endpoints: {
      auth: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/auth`,
      users: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/users`,
      products: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/products`,
      services: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/services`,
      stores: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/stores`,
      orders: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/orders`,
      deliveries: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/deliveries`,
      drivers: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/drivers`,
      messages: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/messages`,
      reviews: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/reviews`,
      notifications: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/notifications`
    }
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Export the serverless handler
module.exports = serverless(app);
