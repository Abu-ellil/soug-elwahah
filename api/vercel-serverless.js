/**
 * @file vercel-serverless.js - Serverless-compatible server for Vercel
 * @description هذا الملف يحتوي على إعداد Vercel serverless functions
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('./modules/auth/routes');
const userRoutes = require('./modules/users/routes');
const driverRoutes = require('./modules/drivers/routes');
const storeRoutes = require('./modules/stores/routes');
const orderRoutes = require('./modules/orders/routes');
const paymentRoutes = require('./modules/payments/routes');
const notificationRoutes = require('./modules/notifications/routes');
const adminRoutes = require('./modules/admin/routes');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:19006', // Expo Metro
    'http://localhost:8081', // React Native Metro
    'http://localhost:19000', // Expo development
    'http://127.0.0.1:19006',
    'http://127.0.0.1:8081',
    'http://127.0.0.1:19000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global database connection state
let dbConnected = false;

// Database connection helper
const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return;
    }

    // Validate required environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    if (!process.env.JWT_EXPIRE) {
      throw new Error('JWT_EXPIRE environment variable is required');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase timeout for server selection
      socketTimeoutMS: 45000, // Increase socket timeout
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    });

    console.log('MongoDB Connected in serverless environment');
    dbConnected = true;
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

// Initialize database connection once
const initializeDB = async () => {
  if (!dbConnected) {
    await connectDB();
  }
};

// Use routes with proper error handling
const wrapRouteHandler = (routeHandler) => {
  return async (req, res, next) => {
    try {
      await initializeDB();
      await routeHandler(req, res, next);
    } catch (error) {
      console.error('Route handler error:', error.message);
      next(error);
    }
  };
};

// Use routes with database initialization
app.use('/api/auth', wrapRouteHandler(authRoutes));
app.use('/api/users', wrapRouteHandler(userRoutes));
app.use('/api/drivers', wrapRouteHandler(driverRoutes));
app.use('/api/stores', wrapRouteHandler(storeRoutes));
app.use('/api/orders', wrapRouteHandler(orderRoutes));
app.use('/api/payments', wrapRouteHandler(paymentRoutes));
app.use('/api/notifications', wrapRouteHandler(notificationRoutes));
app.use('/api/admin', wrapRouteHandler(adminRoutes));

// API root
app.get('/api', (req, res) => {
  res.json({ message: 'Tawseela Backend API is running!' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Error handler
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
};

app.use(errorHandler);

// Export for Vercel
module.exports = app;
