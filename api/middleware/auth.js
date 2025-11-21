/**
 * @file middleware/auth.js - Authentication middleware
 * @description هذا الملف يتضمن Middleware للتحقق من صحة المستخدم باستخدام JWT
 */

const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
const StoreOwner = require('../models/StoreOwner');
const User = require('../models/User'); // الحفاظ على النموذج القديم للتوافق
const logger = require('../utils/logger');

// Middleware عام للتحقق من صحة JWT
const auth = async (req, res, next) => {
  try {
    // استخراج الرمز من رأس الطلب
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // التحقق من وجود الرمز
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // التحقق من الرمز
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // محاولة العثور على المستخدم في النماذج الثلاثة
      let user = null;
      user = await Customer.findById(decoded.id).select('-password');
      if (!user) {
        user = await Driver.findById(decoded.id).select('-password');
      }
      if (!user) {
        user = await StoreOwner.findById(decoded.id).select('-password');
      }
      if (!user) {
        user = await User.findById(decoded.id).select('-password'); // للتوافق مع النموذج القديم
      }
      
      // التحقق من أن المستخدم نشط
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is inactive'
        });
      }

      // تعيين المستخدم في الطلب
      req.user = user;
      next();
    } catch (error) {
      logger.error(`Token verification error: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Middleware للتحقق من دور المستخدم
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Middleware لحماية العملاء
const protectCustomer = async (req, res, next) => {
  try {
    // استخراج الرمز من رأس الطلب
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // التحقق من وجود الرمز
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // التحقق من الرمز
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // العثور على العميل
      const customer = await Customer.findById(decoded.id).select('-password');
      
      // التحقق من أن العميل نشط
      if (!customer || !customer.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Customer account is inactive'
        });
      }

      // تعيين العميل في الطلب
      req.customer = customer;
      next();
    } catch (error) {
      logger.error(`Customer token verification error: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } catch (error) {
    logger.error(`Customer authentication error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error during customer authentication'
    });
  }
};

// Middleware لحماية السائقين
const protectDriver = async (req, res, next) => {
  try {
    // استخراج الرمز من رأس الطلب
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // التحقق من وجود الرمز
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // التحقق من الرمز
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // العثور على السائق
      const driver = await Driver.findById(decoded.id).select('-password');
      
      // التحقق من أن السائق نشط
      if (!driver || !driver.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Driver account is inactive'
        });
      }

      // تعيين السائق في الطلب
      req.driver = driver;
      next();
    } catch (error) {
      logger.error(`Driver token verification error: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } catch (error) {
    logger.error(`Driver authentication error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error during driver authentication'
    });
  }
};

// Middleware لحماية ملاك المتاجر
const protectStoreOwner = async (req, res, next) => {
  try {
    // استخراج الرمز من رأس الطلب
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // التحقق من وجود الرمز
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // التحقق من الرمز
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // العثور على مالك المتجر
      const storeOwner = await StoreOwner.findById(decoded.id).select('-password');
      
      // التحقق من أن مالك المتجر نشط
      if (!storeOwner || !storeOwner.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Store owner account is inactive'
        });
      }

      // تعيين مالك المتجر في الطلب
      req.storeOwner = storeOwner;
      next();
    } catch (error) {
      logger.error(`Store owner token verification error: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } catch (error) {
    logger.error(`Store owner authentication error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error during store owner authentication'
    });
  }
};

module.exports = { auth, authorize, protectCustomer, protectDriver, protectStoreOwner };
