/**
 * @file modules/admin/routes.js - Admin routes
 * @description.routes لوحة تحكم المشرف
 */

const express = require('express');
const { auth, authorize } = require('../../middleware/auth');
const { 
  getDashboardStats,
  getAllUsers,
  getAllStores,
  getAllOrders,
  getAllDrivers,
  getAllTransactions,
  updateSettings,
  getSettings
} = require('./controller');

const router = express.Router();

// @route   GET api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get('/dashboard', auth, authorize('admin'), getDashboardStats);

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', auth, authorize('admin'), getAllUsers);

// @route   GET api/admin/stores
// @desc    Get all stores
// @access  Private/Admin
router.get('/stores', auth, authorize('admin'), getAllStores);

// @route   GET api/admin/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/orders', auth, authorize('admin'), getAllOrders);

// @route   GET api/admin/drivers
// @desc    Get all drivers
// @access  Private/Admin
router.get('/drivers', auth, authorize('admin'), getAllDrivers);

// @route   GET api/admin/transactions
// @desc    Get all transactions
// @access  Private/Admin
router.get('/transactions', auth, authorize('admin'), getAllTransactions);

// @route   PUT api/admin/settings
// @desc    Update admin settings
// @access  Private/Admin
router.put('/settings', auth, authorize('admin'), updateSettings);

// @route   GET api/admin/settings
// @desc    Get admin settings
// @access  Private/Admin
router.get('/settings', auth, authorize('admin'), getSettings);

module.exports = router;