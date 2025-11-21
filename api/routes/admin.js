const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Admin dashboard routes - require authentication and admin role
router.get('/dashboard/metrics', protect, authorize('admin'), adminController.getDashboardMetrics);
router.get('/dashboard/activity', protect, authorize('admin'), adminController.getRecentActivity);

// Analytics routes
router.get('/analytics/revenue-trends', protect, authorize('admin'), adminController.getRevenueTrends);
router.get('/analytics/order-trends', protect, authorize('admin'), adminController.getOrderTrends);
router.get('/analytics/user-growth', protect, authorize('admin'), adminController.getUserGrowthTrends);
router.get('/analytics/performance', protect, authorize('admin'), adminController.getPerformanceMetrics);

// System health route
router.get('/system/health', protect, authorize('admin'), adminController.getSystemHealth);

// Stats routes
router.get('/users/stats', protect, authorize('admin'), adminController.getUserStats);
router.get('/orders/stats', protect, authorize('admin'), adminController.getOrderStats);
router.get('/stores/stats', protect, authorize('admin'), adminController.getStoreStats);
router.get('/drivers/stats', protect, authorize('admin'), adminController.getDriverStats);

module.exports = router;