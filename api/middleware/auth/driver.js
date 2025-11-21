/**
 * @file middleware/auth/driver.js - Driver authentication middleware
 * @description وسطاء التحقق من هوية السائق
 */

const jwt = require('jsonwebtoken');
const Driver = require('../../models/Driver');
const asyncHandler = require('../../middleware/async');

// Protect driver routes
exports.protectDriver = asyncHandler(async (req, res, next) => {
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

    // Check if driver exists
    req.driver = await Driver.findById(decoded.id);
    if (!req.driver) {
      return res.status(401).json({
        success: false,
        error: 'No driver found with this id'
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
exports.authorizeDriver = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.driver.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.driver.role} is not authorized to access this route`
      });
    }
    next();
  };
};
