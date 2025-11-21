/**
 * @file server.js - Main server file for Tawseela Backend
 * @description هذا الملف هو نقطة البداية للتطبيق ويتضمن إعداد Express وSocket.io وMongoDB
 */

// استيراد المكتبات
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// استيراد الملفات الخاصة بالمشروع
const connectDB = require('./config/db'); 
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// استيراد.routes
const authRoutes = require('./modules/auth/routes');
const userRoutes = require('./modules/users/routes');
const driverRoutes = require('./modules/drivers/routes');
const storeRoutes = require('./modules/stores/routes');
const orderRoutes = require('./modules/orders/routes');
const paymentRoutes = require('./modules/payments/routes');
const notificationRoutes = require('./modules/notifications/routes');
const adminRoutes = require('./modules/admin/routes');

// إنشاء تطبيق Express
const app = express();

// إعدادات الأمان
app.use(helmet());

// تهيئة CORS
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

// تهيئة rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 10 requests per windowMs
});
app.use(limiter);

// تهيئة body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// تهيئة الاتصال بقاعدة البيانات
connectDB();

// إعداد Socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// تهيئة Socket.io
require('./socket')(io);

// استخدام.routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// جذر API
app.get('/api', (req, res) => {
  res.json({ message: 'Tawseela Backend API is running!' });
});

// استخدام مiddleware لمعالجة الأخطاء
app.use(errorHandler);

// تحديد port
const PORT = process.env.PORT || 5000;

// بدء تشغيل الخادم
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Tawseela Backend server running on port ${PORT}`);
});

// معالجة أخطاء الخادم
server.on('error', (error) => {
 logger.error(`Server error: ${error.message}`);
  console.error(`Server error: ${error.message}`);
});




module.exports = server;     