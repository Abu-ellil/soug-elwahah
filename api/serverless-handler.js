/**
 * @file serverless-handler.js - Optimized serverless handler for Vercel
 * @description Serverless-optimized handler with proper database connection management
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const serverless = require('serverless-http');

// Import routes
const authRoutes = require('./modules/auth/routes');
const userRoutes = require('./modules/users/routes');
const driverRoutes = require('./modules/drivers/routes');
const storeRoutes = require('./modules/stores/routes');
const orderRoutes = require('./modules/orders/routes');
const paymentRoutes = require('./modules/payments/routes');
const notificationRoutes = require('./modules/notifications/routes');
const adminRoutes = require('./modules/admin/routes');

// Global database connection state
let dbConnected = false;

// Enhanced database connection helper for serverless
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

    // Connect with serverless-optimized options
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 second timeout for server selection
      socketTimeoutMS: 45000, // 45 second socket timeout
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log('MongoDB Connected in serverless environment');
    dbConnected = true;
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

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
    'http://127.0.1:19006',
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
  max: 100 // limit each IP to 10 requests per windowMs
});
app.use(limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enhanced route wrapper with proper error handling
const createRouteHandler = (routeModule) => {
  return async (req, res, next) => {
    try {
      // Initialize database connection
      await connectDB();
      // Call the actual route handler
      await routeModule(req, res, next);
    } catch (error) {
      console.error(`Route error in ${req.path}:`, error.message);
      console.error('Error stack:', error.stack);
      
      // Send proper error response
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal Server Error'
      });
    }
  };
};

// Use routes with enhanced error handling
app.use('/api/auth', createRouteHandler(authRoutes));
app.use('/api/users', createRouteHandler(userRoutes));
app.use('/api/drivers', createRouteHandler(driverRoutes));
app.use('/api/stores', createRouteHandler(storeRoutes));
app.use('/api/orders', createRouteHandler(orderRoutes));
app.use('/api/payments', createRouteHandler(paymentRoutes));
app.use('/api/notifications', createRouteHandler(notificationRoutes));
app.use('/api/admin', createRouteHandler(adminRoutes));

// API root
app.get('/api', (req, res) => {
  res.json({ message: 'Tawseela Backend API is running!' });
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await connectDB(); // Ensure connection is established
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Error handler
const errorHandler = (err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
};

app.use(errorHandler);

// Export the serverless handler
module.exports = serverless(app);

// Export the app for testing
module.exports.app = app;
