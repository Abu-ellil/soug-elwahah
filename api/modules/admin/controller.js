/**
 * @file modules/admin/controller.js - Admin controller
 * @description وحدة التحكم للوحة تحكم المشرف
 */

const User = require('../../models/User');
const Store = require('../../models/Store');
const Order = require('../../models/Order');
const Transaction = require('../../models/Transaction');
const Driver = require('../../models/User'); // Same model but with role = 'driver'
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/errorResponse');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  // عدد المستخدمين
  const totalUsers = await User.countDocuments();
  const totalCustomers = await User.countDocuments({ role: 'customer' });
  const totalDrivers = await User.countDocuments({ role: 'driver' });
  const totalStoreOwners = await User.countDocuments({ role: 'store_owner' });

  // عدد المتاجر
  const totalStores = await Store.countDocuments();

  // عدد الطلبات
  const totalOrders = await Order.countDocuments();
  const completedOrders = await Order.countDocuments({ status: 'delivered' });
  const pendingOrders = await Order.countDocuments({ status: 'pending' });

  // عدد المعاملات
  const totalTransactions = await Transaction.countDocuments();
  const totalRevenue = await Transaction.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  // عدد السائقين المعلقين
  const pendingDrivers = await User.countDocuments({ 
    role: 'driver', 
    'driverDocuments.status': 'pending' 
  });

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalCustomers,
      totalDrivers,
      totalStoreOwners,
      totalStores,
      totalOrders,
      completedOrders,
      pendingOrders,
      totalTransactions,
      totalRevenue: totalRevenue[0] ? totalRevenue[0].total : 0,
      pendingDrivers
    }
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
 const users = await User.find().select('-password').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Get all stores
// @route   GET /api/admin/stores
// @access  Private/Admin
exports.getAllStores = asyncHandler(async (req, res, next) => {
 const stores = await Store.find()
    .populate('owner', 'name email phone')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: stores.length,
    data: stores
  });
});

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find()
    .populate('customer', 'name email phone')
    .populate('store', 'name')
    .populate('driver', 'name email phone')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get all drivers
// @route   GET /api/admin/drivers
// @access  Private/Admin
exports.getAllDrivers = asyncHandler(async (req, res, next) => {
 const drivers = await User.find({ role: 'driver' })
    .select('-password')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: drivers.length,
    data: drivers
  });
});

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
exports.getAllTransactions = asyncHandler(async (req, res, next) => {
  const transactions = await Transaction.find()
    .populate('user', 'name email phone')
    .populate('order', 'status')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions
  });
});

// @desc    Update admin settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
exports.updateSettings = asyncHandler(async (req, res, next) => {
 // في تطبيق عملي، سننشئ نموذج إعدادات منفصل
  // الآن نحن نستخدم متغيرات البيئة أو نخزن في قاعدة البيانات
  
  // هذا المثال يعرض كيف يمكن تنفيذ ميزة إعدادات العمولة
  const { commissionRate, deliveryFee, appSettings } = req.body;
  
  // في تطبيق عملي، نخزن الإعدادات في قاعدة البيانات
 // نحن نعيد فقط رسالة تأكيد لأننا نستخدم .env للإعدادات
  
  res.status(200).json({
    success: true,
    message: 'Settings updated successfully (in production, settings would be saved to database)',
    data: {
      commissionRate,
      deliveryFee,
      appSettings
    }
  });
});

// @desc    Get admin settings
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getSettings = asyncHandler(async (req, res, next) => {
 // في تطبيق عملي، نجلب الإعدادات من قاعدة البيانات
  // الآن نعيد إعدادات تجريبية
  
  res.status(200).json({
    success: true,
    data: {
      commissionRate: process.env.COMMISSION_RATE || 0.15, // 15% default commission
      deliveryFee: process.env.DELIVERY_FEE || 15,
      currency: process.env.CURRENCY || 'EGP',
      appVersion: '1.0.0',
      features: {
        wallet: true,
        notifications: true,
        gpsTracking: true,
        multiplePaymentMethods: true
      }
    }
  });
});