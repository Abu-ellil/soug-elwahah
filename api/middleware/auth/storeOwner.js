/**
 * @file middleware/auth/storeOwner.js - Store Owner authentication middleware
 * @description وسطاء التحقق من هوية مالك المتجر
 */

const jwt = require('jsonwebtoken');
const StoreOwner = require('../../models/StoreOwner');
const asyncHandler = require('../../middleware/async');

// Protect store owner routes
exports.protectStoreOwner = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if store owner exists
    req.storeOwner = await StoreOwner.findById(decoded.id);
    if (!req.storeOwner) {
      return res.status(401).json({
        success: false,
        error: 'No store owner found with this id'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
});

// Grant access to specific roles
exports.authorizeStoreOwner = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.storeOwner.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.storeOwner.role} is not authorized to access this route`
      });
    }
    next();
  };
};
