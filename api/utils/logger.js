/**
 * @file utils/logger.js - Logger utility
 * @description وحدة تسجيل الأحداث للتطبيق
 */

const winston = require('winston');

// إنشاء م_INSTANCE من المسجل
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'tawseela-backend' },
  transports: [
    // تسجيل الأخطاء في ملف
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    // تسجيل جميع الأحداث في ملف
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

// في بيئة التطوير، تسجيل الأحداث في وحدة التحكم أيضًا
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;