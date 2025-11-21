/**
 * @file driverRoutes.js - Driver Routes for Tawseela Backend
 * @description مسارات تسجيل وتسجيل دخول السائقين
 */

const express = require('express');
const { 
  registerDriver, 
  loginDriver, 
  getMe, 
  updateDetails, 
  updatePassword, 
  forgotPassword, 
  resetPassword,
 uploadDocuments,
  updateOnlineStatus,
  logout
} = require('./controller');

const router = express.Router();

// تضمين middleware المصادقة للعمليات الخاصة
const { protectDriver } = require('../../middleware/auth');

router.post('/register', registerDriver);
router.post('/login', loginDriver);
router.post('/logout', logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// مسارات تتطلب مصادقة السائق
router.use(protectDriver);

router.get('/me', getMe);
router.put('/me', updateDetails);
router.put('/me/password', updatePassword);
router.put('/me/documents', uploadDocuments);
router.put('/me/online', updateOnlineStatus);

module.exports = router;
