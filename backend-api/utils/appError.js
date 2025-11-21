/**
 * Custom Application Error Class
 * Extends the built-in Error class to provide additional functionality
 * for handling operational errors in the application
 */
class AppError extends Error {
  /**
   * Create an AppError instance
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {boolean} isOperational - Whether this is an operational error
   * @param {string} errorCode - Custom error code for client identification
   */
  constructor(message, statusCode = 500, isOperational = true, errorCode = null) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    
    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a 400 Bad Request error
   * @param {string} message - Error message
   * @param {string} errorCode - Custom error code
   * @returns {AppError} AppError instance
   */
  static badRequest(message = 'طلب غير صحيح', errorCode = 'BAD_REQUEST') {
    return new AppError(message, 400, true, errorCode);
  }

  /**
   * Create a 401 Unauthorized error
   * @param {string} message - Error message
   * @param {string} errorCode - Custom error code
   * @returns {AppError} AppError instance
   */
  static unauthorized(message = 'غير مصرح', errorCode = 'UNAUTHORIZED') {
    return new AppError(message, 401, true, errorCode);
  }

  /**
   * Create a 403 Forbidden error
   * @param {string} message - Error message
   * @param {string} errorCode - Custom error code
   * @returns {AppError} AppError instance
   */
  static forbidden(message = 'ممنوع', errorCode = 'FORBIDDEN') {
    return new AppError(message, 403, true, errorCode);
  }

  /**
   * Create a 404 Not Found error
   * @param {string} message - Error message
   * @param {string} errorCode - Custom error code
   * @returns {AppError} AppError instance
   */
  static notFound(message = 'غير موجود', errorCode = 'NOT_FOUND') {
    return new AppError(message, 404, true, errorCode);
  }

  /**
   * Create a 409 Conflict error
   * @param {string} message - Error message
   * @param {string} errorCode - Custom error code
   * @returns {AppError} AppError instance
   */
  static conflict(message = 'تعارض في البيانات', errorCode = 'CONFLICT') {
    return new AppError(message, 409, true, errorCode);
  }

  /**
   * Create a 422 Unprocessable Entity error
   * @param {string} message - Error message
   * @param {string} errorCode - Custom error code
   * @returns {AppError} AppError instance
   */
  static validationError(message = 'خطأ في التحقق من البيانات', errorCode = 'VALIDATION_ERROR') {
    return new AppError(message, 422, true, errorCode);
  }

  /**
   * Create a 429 Too Many Requests error
   * @param {string} message - Error message
   * @param {string} errorCode - Custom error code
   * @returns {AppError} AppError instance
   */
  static tooManyRequests(message = 'طلبات كثيرة جداً', errorCode = 'TOO_MANY_REQUESTS') {
    return new AppError(message, 429, true, errorCode);
  }

  /**
   * Create a 500 Internal Server Error
   * @param {string} message - Error message
   * @param {string} errorCode - Custom error code
   * @returns {AppError} AppError instance
   */
  static internalError(message = 'خطأ داخلي في الخادم', errorCode = 'INTERNAL_ERROR') {
    return new AppError(message, 500, true, errorCode);
  }

  /**
   * Create a 503 Service Unavailable error
   * @param {string} message - Error message
   * @param {string} errorCode - Custom error code
   * @returns {AppError} AppError instance
   */
  static serviceUnavailable(message = 'الخدمة غير متاحة', errorCode = 'SERVICE_UNAVAILABLE') {
    return new AppError(message, 503, true, errorCode);
  }

  /**
   * Convert error to JSON format
   * @returns {Object} JSON representation of the error
   */
  toJSON() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      status: this.status,
      errorCode: this.errorCode,
      isOperational: this.isOperational,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
    };
  }
}

module.exports = AppError;