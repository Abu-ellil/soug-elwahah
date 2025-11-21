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

// Environment check endpoint (for debugging)
app.get('/env-check', (req, res) => {
  const requiredEnvVars = [
    'MONGODB_URI', 
    'JWT_SECRET', 
    'NODE_ENV', 
    'API_VERSION'
  ];
  
  const envStatus = {};
  requiredEnvVars.forEach(envVar => {
    envStatus[envVar] = process.env[envVar] ? '✅ SET' : '❌ NOT SET';
  });
  
  res.status(200).json({
    success: true,
    message: 'Environment Variables Check (DEBUG - No Database)',
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      VERCEL: process.env.VERCEL || 'not set',
      ...envStatus
    },
    timestamp: new Date().toISOString(),
    debug: 'This endpoint works without database connection'
  });
});

// Health check endpoint (no database required)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ElSoug API is running successfully! 🚀 (DEBUG VERSION)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0-debug',
    debug: 'Database connection disabled for testing'
  });
});

// API routes - simple mock responses (no database)
const API_VERSION = process.env.API_VERSION || 'v1';

// Mock auth routes
app.get(`/api/${API_VERSION}/auth/test`, (req, res) => {
  res.json({
    success: true,
    message: 'Auth endpoint working (no database)',
    timestamp: new Date().toISOString()
  });
});

// Mock customer routes  
app.get(`/api/${API_VERSION}/customer/test`, (req, res) => {
  res.json({
    success: true,
    message: 'Customer endpoint working (no database)',
    timestamp: new Date().toISOString()
  });
});

// Mock products routes
app.get(`/api/${API_VERSION}/products/test`, (req, res) => {
  res.json({
    success: true,
    message: 'Products endpoint working (no database)',
    timestamp: new Date().toISOString()
  });
});

// Base API route
app.get(`/api/${API_VERSION}`, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ElSoug API - السوق المحلي 🇪🇬 (DEBUG VERSION)',
    version: '1.0.0-debug',
    debug: 'Database connection disabled for testing',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      '/health',
      '/env-check',
      `/api/${API_VERSION}/auth/test`,
      `/api/${API_VERSION}/customer/test`,
      `/api/${API_VERSION}/products/test`
    ]
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'مرحباً بك في ElSoug API - السوق المحلي للقرى المصرية 🇪🇬 (DEBUG VERSION)',
    version: '1.0.0-debug',
    debug: 'Database connection disabled for testing',
    endpoints: {
      health: '/health',
      'env-check': '/env-check',
      'api-info': `/api/${API_VERSION}`
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found - DEBUG VERSION',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error - DEBUG VERSION',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Export the serverless handler with minimal configuration
module.exports = serverless(app);