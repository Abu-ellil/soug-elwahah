/**
 * @file customerRoutes.js - Customer Routes for Tawseela Backend
 * @description مسارات تسجيل وتسجيل دخول العملاء مع المميزات المتقدمة
 */

const express = require('express');
const { 
  registerCustomer, 
  loginCustomer, 
  getMe, 
  updateDetails, 
  updatePassword, 
  forgotPassword, 
  resetPassword,
  logout
} = require('./controller');
const advancedAuth = require('./advancedAuthController');

// تضمين المسارات المتقدمة
const advancedAuthRoutes = require('./advancedAuthRoutes');

const router = express.Router();

// تضمين middleware المصادقة للعمليات الخاصة
const { protectCustomer } = require('../../middleware/auth');

// المسارات الأساسية
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/logout', logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// المسارات المتقدمة
router.use('/auth', advancedAuthRoutes);

// مسارات تتطلب مصادقة العميل
router.use(protectCustomer);

router.get('/me', getMe);
router.put('/me', updateDetails);
router.put('/me/password', updatePassword);

module.exports = router;
