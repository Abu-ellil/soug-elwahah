/**
 * @file middleware/auth/admin.js - Admin authentication middleware
 * @description وسطاء التحقق من هوية المشرف
 */

const jwt = require('jsonwebtoken');
const Admin = require('../../models/Admin');
const asyncHandler = require('../../middleware/async');

// Protect admin routes
exports.protectAdmin = asyncHandler(async (req, res, next) => {
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

    // Check if admin exists
    req.admin = await Admin.findById(decoded.id);
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: 'No admin found with this id'
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
exports.authorizeAdmin = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.admin.role} is not authorized to access this route`
      });
    }
    next();
  };
};
