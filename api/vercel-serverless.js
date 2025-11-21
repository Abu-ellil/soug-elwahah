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

// Database connection helper
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB Connected');
    }
  } catch (error) {
    console.error('Database connection error:', error.message);
    throw error;
  }
};

// Initialize database connection
let dbConnected = false;
const initializeDB = async () => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
};

// Use routes
app.use('/api/auth', async (req, res, next) => {
  await initializeDB();
  authRoutes(req, res, next);
});

app.use('/api/users', async (req, res, next) => {
  await initializeDB();
  userRoutes(req, res, next);
});

app.use('/api/drivers', async (req, res, next) => {
  await initializeDB();
  driverRoutes(req, res, next);
});

app.use('/api/stores', async (req, res, next) => {
  await initializeDB();
  storeRoutes(req, res, next);
});

app.use('/api/orders', async (req, res, next) => {
  await initializeDB();
  orderRoutes(req, res, next);
});

app.use('/api/payments', async (req, res, next) => {
  await initializeDB();
  paymentRoutes(req, res, next);
});

app.use('/api/notifications', async (req, res, next) => {
  await initializeDB();
  notificationRoutes(req, res, next);
});

app.use('/api/admin', async (req, res, next) => {
  await initializeDB();
  adminRoutes(req, res, next);
});

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