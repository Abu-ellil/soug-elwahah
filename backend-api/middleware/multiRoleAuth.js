const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken, extractToken } = require('../utils/jwt');

/**
 * Protect middleware - Verify JWT token and authenticate user with multi-role support
 */
const protectWithMultiRole = asyncHandler(async (req, res, next) => {
  // 1) Get token from request
  const token = extractToken(req);

  if (!token) {
    return next(new AppError('يجب تسجيل الدخول للوصول إلى هذا المورد', 401));
  }

  // 2) Verify token
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('رمز المصادقة غير صحيح', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(new AppError('انتهت صلاحية رمز المصادقة، يرجى تسجيل الدخول مرة أخرى', 401));
    }
    return next(new AppError('خطأ في المصادقة', 401));
  }

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id).select('+active');
  if (!currentUser) {
    return next(new AppError('المستخدم المرتبط بهذا الرمز لم يعد موجوداً', 401));
  }

  // 4) Check if user is active
  if (!currentUser.active) {
    return next(new AppError('تم إلغاء تفعيل حسابك، يرجى التواصل مع الدعم', 401));
  }

  // 5) Check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('تم تغيير كلمة المرور مؤخراً، يرجى تسجيل الدخول مرة أخرى', 401));
  }

  // 6) Update last login info
 currentUser.lastLoginAt = new Date();
  currentUser.lastLoginFrom = req.ip;
  await currentUser.save({ validateBeforeSave: false });

  // Grant access to protected route
  req.user = currentUser;
  next();
});

/**
 * Authorize for specific application type
 * @param {string} appType - Application type (customer, driver, store)
 * @param {...string} roles - Additional required roles
 */
const authorizeForApp = (appType, ...roles) => {
  return (req, res, next) => {
    // First check if user has the app-specific role
    const hasAppRole = req.user.roles.includes(appType);
    
    if (!hasAppRole) {
      return next(new AppError(`لا يمكنك الوصول إلى ${appType} التطبيق`, 403));
    }
    
    // If additional roles are specified, check for those too
    if (roles.length > 0) {
      const hasRequiredRole = roles.some(role => req.user.roles.includes(role));
      if (!hasRequiredRole) {
        return next(new AppError('لا تملك الصلاحيات المطلوبة', 403));
      }
    }
    
    next();
  };
};

/**
 * Check if user has specific permission
 * @param {string} permission - Required permission
 */
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions.includes(permission)) {
      return next(new AppError('لا تملك الصلاحية المطلوبة', 403));
    }
    next();
  };
};

/**
 * Middleware to set user's active role based on the application context
 * @param {string} role - Role to set as active
 */
const setActiveRole = (role) => {
  return (req, res, next) => {
    if (!req.user.roles.includes(role)) {
      return next(new AppError('لا يمكنك استخدام هذا الدور', 403));
    }
    
    req.user.activeRole = role;
    // Update permissions based on active role
    req.user.permissions = getPermissionsForRole(role);
    
    next();
  };
};

/**
 * Get permissions for a specific role
 * @param {string} role - Role to get permissions for
 */
const getPermissionsForRole = (role) => {
  const permissions = {
    customer: [
      'profile:read', 'profile:update', 'profile:delete',
      'order:create', 'order:read', 'order:update', 'order:cancel',
      'payment:read', 'payment:create', 'payment:update', 'payment:delete',
      'address:read', 'address:create', 'address:update', 'address:delete',
      'chat:read', 'chat:send', 'notification:read',
      'review:create', 'review:update', 'review:read'
    ],
    driver: [
      'profile:read', 'profile:update', 'profile:location',
      'order:read', 'order:accept', 'order:pickup', 'order:deliver', 'order:cancel',
      'delivery:read', 'delivery:stats',
      'vehicle:read', 'vehicle:update',
      'chat:read', 'chat:send', 'notification:read',
      'earnings:read', 'payout:request'
    ],
    store: [
      'store:read', 'store:update', 'store:location',
      'product:create', 'product:read', 'product:update', 'product:delete',
      'service:create', 'service:read', 'service:update', 'service:delete',
      'order:read', 'order:accept', 'order:prepare', 'order:ready',
      'inventory:read', 'inventory:update',
      'analytics:read', 'reports:read',
      'chat:read', 'chat:send', 'notification:read'
    ],
    admin: [
      'admin:all', 'user:manage', 'content:manage', 'system:config'
    ],
    superadmin: [
      'admin:all', 'user:manage', 'content:manage', 'system:config', 'system:admin'
    ]
 };
  
  return permissions[role] || [];
};

/**
 * Middleware to validate user profile completeness based on active role
 */
const validateProfile = asyncHandler(async (req, res, next) => {
  const { activeRole } = req.user;
  
  // Check if profile is complete based on active role
  let isProfileComplete = true;
  
  switch(activeRole) {
    case 'customer':
      isProfileComplete = !!req.user.name && req.user.isPhoneVerified;
      break;
    case 'driver':
      isProfileComplete = !!req.user.name && 
                         req.user.isPhoneVerified && 
                         req.user.profile?.driver?.vehicleInfo;
      break;
    case 'store':
      isProfileComplete = !!req.user.name && 
                         req.user.isPhoneVerified && 
                         req.user.profile?.store?.businessName;
      break;
    default:
      isProfileComplete = !!req.user.name && req.user.isPhoneVerified;
  }
  
  if (!isProfileComplete) {
    return next(new AppError('يرجى إكمال ملفك الشخصي أولاً', 400));
  }
  
  next();
});

module.exports = {
  protectWithMultiRole,
  authorizeForApp,
  hasPermission,
  setActiveRole,
  getPermissionsForRole,
  validateProfile
};