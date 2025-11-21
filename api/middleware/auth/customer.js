/**
 * @file middleware/auth/customer.js - Customer authentication middleware
 * @description وسطاء التحقق من هوية العميل
 */

const jwt = require('jsonwebtoken');
const Customer = require('../../models/Customer');
const asyncHandler = require('../../middleware/async');

// Protect customer routes
exports.protectCustomer = asyncHandler(async (req, res, next) => {
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

    // Check if customer exists
    req.customer = await Customer.findById(decoded.id);
    if (!req.customer) {
      return res.status(401).json({
        success: false,
        error: 'No customer found with this id'
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
exports.authorizeCustomer = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.customer.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.customer.role} is not authorized to access this route`
      });
    }
    next();
  };
};
