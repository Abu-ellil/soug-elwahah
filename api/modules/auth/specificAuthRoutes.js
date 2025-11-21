/**
 * @file specificAuthRoutes.js - Specific Authentication Routes for Tawseela Backend
 * @description مسارات التحقق من الهوية الخاصة بأنواع المستخدمين المختلفة
 */

const express = require('express');
const router = express.Router();
const { register, login, getMe, updateDetails, updatePassword, forgotPassword, resetPassword, logout } = require('./specificAuthController');

const { protectCustomer } = require('../../middleware/auth/customer');
const { protectDriver } = require('../../middleware/auth/driver');
const { protectStoreOwner } = require('../../middleware/auth/storeOwner');
const { protectAdmin } = require('../../middleware/auth/admin');

// Apply protect middleware based on user type
const getProtectMiddleware = (userType) => {
  switch(userType.toLowerCase()) {
    case 'customer':
      return protectCustomer;
    case 'driver':
      return protectDriver;
    case 'storeowner':
      return protectStoreOwner;
    case 'admin':
      return protectAdmin;
    default:
      return (req, res, next) => {
        res.status(400).json({ success: false, error: `Invalid user type: ${userType}` });
      };
  }
};

// Routes for customer authentication
router.route('/customer/register').post(register);
router.route('/customer/login').post(login);
router.route('/customer/me')
  .get(protectCustomer, getMe)
  .put(protectCustomer, updateDetails);
router.route('/customer/me/password').put(protectCustomer, updatePassword);
router.route('/customer/forgotpassword').post(forgotPassword);
router.route('/customer/resetpassword/:resettoken').put(resetPassword);
router.route('/customer/logout').get(protectCustomer, logout);

// Routes for driver authentication
router.route('/driver/register').post(register);
router.route('/driver/login').post(login);
router.route('/driver/me')
  .get(protectDriver, getMe)
  .put(protectDriver, updateDetails);
router.route('/driver/me/password').put(protectDriver, updatePassword);
router.route('/driver/forgotpassword').post(forgotPassword);
router.route('/driver/resetpassword/:resettoken').put(resetPassword);
router.route('/driver/logout').get(protectDriver, logout);

// Routes for store owner authentication
router.route('/storeowner/register').post(register);
router.route('/storeowner/login').post(login);
router.route('/storeowner/me')
  .get(protectStoreOwner, getMe)
  .put(protectStoreOwner, updateDetails);
router.route('/storeowner/me/password').put(protectStoreOwner, updatePassword);
router.route('/storeowner/forgotpassword').post(forgotPassword);
router.route('/storeowner/resetpassword/:resettoken').put(resetPassword);
router.route('/storeowner/logout').get(protectStoreOwner, logout);

// Routes for admin authentication
router.route('/admin/register').post(register);
router.route('/admin/login').post(login);
router.route('/admin/me')
  .get(protectAdmin, getMe)
  .put(protectAdmin, updateDetails);
router.route('/admin/me/password').put(protectAdmin, updatePassword);
router.route('/admin/forgotpassword').post(forgotPassword);
router.route('/admin/resetpassword/:resettoken').put(resetPassword);
router.route('/admin/logout').get(protectAdmin, logout);

module.exports = router;
