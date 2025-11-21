/**
 * @file config/db.js - Database connection module
 * @description هذا الملف يتضمن إعدادات الاتصال بقاعدة بيانات MongoDB Atlas
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // الاتصال بقاعدة البيانات
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

// معالجة أحداث قاعدة البيانات
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
  console.log('MongoDB reconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = connectDB;