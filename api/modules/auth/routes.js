/**
 * @file modules/auth/routes.js - Authentication routes
 * @description.routes للتحقق من الهوية (تسجيل الدخول، تسجيل الخروج، إنشاء حساب)
 */

const express = require('express');
const { body } = require('express-validator');
const { register, login, logout, getMe, updateProfile, forgotPassword, resetPassword, verifyEmail } = require('./controller');
const { auth } = require('../../middleware/auth');

const router = express.Router();

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  body('phone', 'Phone number is required').not().isEmpty(),
  body('role', 'Role is required').not().isEmpty()
], register);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], login);

// @route   POST api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, logout);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, getMe);

// @route   PUT api/auth/me
// @desc    Update current user profile
// @access  Private
router.put('/me', auth, [
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('phone', 'Phone number is required').not().isEmpty()
], updateProfile);

// @route   POST api/auth/forgotpassword
// @desc    Forgot password
// @access  Public
router.post('/forgotpassword', [
  body('email', 'Please include a valid email').isEmail()
], forgotPassword);

// @route   PUT api/auth/resetpassword/:resettoken
// @desc    Reset password
// @access  Public
router.put('/resetpassword/:resettoken', [
  body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], resetPassword);

// @route   GET api/auth/verify/:verificationtoken
// @desc    Verify email
// @access  Public
router.get('/verify/:verificationtoken', verifyEmail);

// Include specific authentication routes
const specificAuthRoutes = require('./specificAuthRoutes');
router.use('/', specificAuthRoutes);

module.exports = router;
