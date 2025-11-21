const { validationResult } = require('express-validator');
const AppError = require('../utils/appError');

/**
 * Middleware to handle validation errors from express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Extract error messages
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    // Create a formatted error message
    const message = errorMessages.map(err => `${err.field}: ${err.message}`).join(', ');
    
    return next(new AppError(`خطأ في التحقق من البيانات: ${message}`, 400, errorMessages));
  }
  
  next();
};

/**
 * Custom validation middleware factory
 * @param {Array} validations - Array of express-validator validation chains
 * @returns {Array} Array of validation middleware functions
 */
const createValidation = (validations) => {
  return [
    ...validations,
    validate
  ];
};

/**
 * Sanitize request data by removing undefined and null values
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const sanitizeRequest = (req, res, next) => {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (req.body[key] === undefined || req.body[key] === null || req.body[key] === '') {
        delete req.body[key];
      }
    });
  }
  
  // Sanitize query
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(key => {
      if (req.query[key] === undefined || req.query[key] === null || req.query[key] === '') {
        delete req.query[key];
      }
    });
  }
  
  next();
};

/**
 * Validate file upload middleware
 * @param {Object} options - Validation options
 * @param {Array} options.allowedTypes - Allowed file types
 * @param {Number} options.maxSize - Maximum file size in bytes
 * @param {Number} options.maxFiles - Maximum number of files
 */
const validateFileUpload = (options = {}) => {
  const {
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize = 5 * 1024 * 1024, // 5MB
    maxFiles = 5
  } = options;
  
  return (req, res, next) => {
    if (!req.files && !req.file) {
      return next();
    }
    
    const files = req.files || [req.file];
    
    // Check number of files
    if (files.length > maxFiles) {
      return next(new AppError(`لا يمكن رفع أكثر من ${maxFiles} ملفات`, 400));
    }
    
    // Validate each file
    for (const file of files) {
      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        return next(new AppError(`نوع الملف غير مدعوم: ${file.mimetype}. الأنواع المدعومة: ${allowedTypes.join(', ')}`, 400));
      }
      
      // Check file size
      if (file.size > maxSize) {
        return next(new AppError(`حجم الملف كبير جداً. الحد الأقصى: ${maxSize / (1024 * 1024)}MB`, 400));
      }
    }
    
    next();
  };
};

/**
 * Validate pagination parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      return next(new AppError('رقم الصفحة يجب أن يكون رقم صحيح أكبر من 0', 400));
    }
    req.query.page = pageNum;
  }
  
  if (limit) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return next(new AppError('حد النتائج يجب أن يكون رقم صحيح بين 1 و 100', 400));
    }
    req.query.limit = limitNum;
  }
  
  next();
};

/**
 * Validate sort parameters
 * @param {Array} allowedFields - Array of allowed sort fields
 */
const validateSort = (allowedFields = []) => {
  return (req, res, next) => {
    const { sort } = req.query;
    
    if (sort) {
      const sortFields = sort.split(',');
      
      for (const field of sortFields) {
        const fieldName = field.replace(/^-/, ''); // Remove minus sign for desc sort
        
        if (allowedFields.length > 0 && !allowedFields.includes(fieldName)) {
          return next(new AppError(`حقل الترتيب غير مدعوم: ${fieldName}. الحقول المدعومة: ${allowedFields.join(', ')}`, 400));
        }
      }
    }
    
    next();
  };
};

module.exports = {
  validate,
  createValidation,
  sanitizeRequest,
  validateFileUpload,
  validatePagination,
  validateSort
};