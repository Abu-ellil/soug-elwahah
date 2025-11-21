const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getAllStores,
  getStoreById,
  updateStoreStatus,
  updateCommissionRate,
  deleteStore,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getSystemAnalytics,
  getUserAnalytics,
  getStoreAnalytics,
  getOrderAnalytics,
  getFinancialAnalytics
} = require('../controllers/adminController');

const router = express.Router();

// Admin - Users Management
router.route('/users')
  .get(protect, authorize('admin', 'superadmin'), getAllUsers);

router.route('/users/:id')
  .get(protect, authorize('admin', 'superadmin'), getUserById)
  .put(protect, authorize('admin', 'superadmin'), updateUserRole)
  .patch(protect, authorize('admin', 'superadmin'), updateUserStatus)
  .delete(protect, authorize('admin', 'superadmin'), deleteUser);

// Admin - Stores Management
router.route('/stores')
  .get(protect, authorize('admin', 'superadmin'), getAllStores);

router.route('/stores/:id')
  .get(protect, authorize('admin', 'superadmin'), getStoreById)
  .put(protect, authorize('admin', 'superadmin'), updateStoreStatus)
  .patch(protect, authorize('admin', 'superadmin'), updateCommissionRate)
  .delete(protect, authorize('admin', 'superadmin'), deleteStore);

// Admin - Orders Management
router.route('/orders')
  .get(protect, authorize('admin', 'superadmin'), getAllOrders);

router.route('/orders/:id')
  .get(protect, authorize('admin', 'superadmin'), getOrderById)
  .put(protect, authorize('admin', 'superadmin'), updateOrderStatus);

// Admin - Analytics
router.route('/analytics/system')
  .get(protect, authorize('admin', 'superadmin'), getSystemAnalytics);

router.route('/analytics/users')
  .get(protect, authorize('admin', 'superadmin'), getUserAnalytics);

router.route('/analytics/stores')
  .get(protect, authorize('admin', 'superadmin'), getStoreAnalytics);

router.route('/analytics/orders')
  .get(protect, authorize('admin', 'superadmin'), getOrderAnalytics);

router.route('/analytics/financial')
  .get(protect, authorize('admin', 'superadmin'), getFinancialAnalytics);

module.exports = router;
