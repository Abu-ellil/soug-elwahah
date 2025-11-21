/**
 * @file utils/errorResponse.js - Error response class
 * @description فئة لتصنيف أخطاء API
 */

class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    
    // حفظ تتبع الخطأ
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorResponse;