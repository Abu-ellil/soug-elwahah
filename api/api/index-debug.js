// Debug version of serverless function to help identify environment variable issues
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

// Debug middleware to log environment variables
app.use((req, res, next) => {
  console.log('🔍 Debug Info:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('VERCEL:', process.env.VERCEL);
  console.log('MONGODB_URI set:', !!process.env.MONGODB_URI);
  console.log('JWT_SECRET set:', !!process.env.JWT_SECRET);
  console.log('API_VERSION:', process.env.API_VERSION);
  next();
});

// Environment check endpoint
app.get('/env-check', (req, res) => {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV || 'not set',
    VERCEL: process.env.VERCEL || 'not set',
    MONGODB_URI: process.env.MONGODB_URI ? '***SET***' : '❌ NOT SET',
    JWT_SECRET: process.env.JWT_SECRET ? '***SET***' : '❌ NOT SET',
    API_VERSION: process.env.API_VERSION || 'not set'
  };
  
  res.status(200).json({
    success: true,
    message: 'Environment Variables Check',
    environment: envVars,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint (simplified, no database)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running! (Debug Version - No DB)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0-debug'
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ElSoug API - Debug Mode (No Database Required)',
    version: '1.0.0-debug',
    endpoints: {
      health: '/health',
      'env-check': '/env-check'
    },
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    success: false,
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Export the serverless handler
module.exports = serverless(app);