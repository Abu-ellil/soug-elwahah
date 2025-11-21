const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

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
const productRoutes = require('../routes/products');
const serviceRoutes = require('../routes/services');
const storeRoutes = require('../routes/store');
const orderRoutes = require('../routes/orders');
const messageRoutes = require('../routes/messages');
const reviewRoutes = require('../routes/reviews');
const notificationRoutes = require('../routes/notifications');
const categoryRoutes = require('../routes/categories');
const testRoutes = require('../routes/test');

// Create Express app
const app = express();

// Trust proxy (important for Vercel deployment)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Simple CORS configuration
app.use(cors({
  origin: '*',
  credentials: true
}));

// Cookie parsing middleware
app.use(cookieParser());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Compression middleware
app.use(compression());

// Logging middleware - only in development to avoid hanging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
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
app.use(`/api/${API_VERSION}/messages`, messageRoutes);
app.use(`/api/${API_VERSION}/reviews`, reviewRoutes);
app.use(`/api/${API_VERSION}/notifications`, notificationRoutes);
app.use(`/api/${API_VERSION}/categories`, categoryRoutes);
app.use(`/api/${API_VERSION}/test`, testRoutes);

// Mount admin routes
app.use(`/api/${API_VERSION}/admin`, adminRoutes);

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

// Export the serverless handler with minimal configuration
module.exports = serverless(app);
