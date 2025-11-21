const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generate JWT token for user
 * @param {string} userId - User ID
 * @param {string} role - User role (optional)
 * @param {Array} roles - User roles array (for multi-role support)
 * @param {string} activeRole - Active role
 * @param {Array} permissions - User permissions
 * @returns {string} JWT token
 */
const signToken = (userId, role = 'user', roles = [], activeRole = 'customer', permissions = []) => {
  return jwt.sign(
    {
      id: userId,
      role: role, // Legacy role for backward compatibility
      roles: roles, // New multi-role support
      activeRole: activeRole,
      permissions: permissions,
      iat: Date.now()
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
 );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Generate refresh token
 * @returns {string} Refresh token
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

/**
 * Create and send token response
 * @param {Object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 * @param {string} message - Response message
 */
const createSendToken = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user._id, user.role, user.roles, user.activeRole, user.permissions);
  const refreshToken = generateRefreshToken();
  
  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Send cookie
  res.cookie('jwt', token, cookieOptions);
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  });

  // Remove password from output
  user.password = undefined;
  user.refreshToken = refreshToken;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    refreshToken,
    data: {
      user
    }
  });
};

/**
 * Extract token from request
 * @param {Object} req - Express request object
 * @returns {string|null} Token or null
 */
const extractToken = (req) => {
  let token;
  
  // Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check cookies
  else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  
  return token;
};

/**
 * Decode token without verification (for expired tokens)
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload or null
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = {
  signToken,
  verifyToken,
  generateRefreshToken,
  createSendToken,
  extractToken,
  decodeToken
};