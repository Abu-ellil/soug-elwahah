/**
 * @file storeOwnerRoutes.js - Store Owner Routes for Tawseela Backend
 * @description مسارات تسجيل وتسجيل دخول ملاك المتاجر
 */

const express = require('express');
const { 
  registerStoreOwner, 
  loginStoreOwner, 
  getMe, 
  updateDetails, 
  updatePassword, 
  forgotPassword, 
 resetPassword,
  uploadDocuments,
  logout
} = require('./controller');

const router = express.Router();

// تضمين middleware المصادقة للعمليات الخاصة
const { protectStoreOwner } = require('../../middleware/auth');

router.post('/register', registerStoreOwner);
router.post('/login', loginStoreOwner);
router.post('/logout', logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// مسارات تتطلب مصادقة مالك المتجر
router.use(protectStoreOwner);

router.get('/me', getMe);
router.put('/me', updateDetails);
router.put('/me/password', updatePassword);
router.put('/me/documents', uploadDocuments);

module.exports = router;
