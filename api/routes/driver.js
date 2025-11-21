const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getNearbyOrders,
 bidOnOrder,
  updateBid,
  getDriverOrders,
  updateOrderStatus,
  getDriverProfile,
  updateDriverProfile,
  updateAvailability,
  getEarnings,
  getAnalytics,
  acceptOrderBid,
  getBidHistory
} = require('../controllers/driverController');

const router = express.Router();

// Driver - Get nearby orders
router.route('/orders/nearby')
  .get(protect, authorize('driver'), getNearbyOrders);

// Driver - Bid on orders
router.route('/orders/:orderId/bid')
  .post(protect, authorize('driver'), bidOnOrder)
  .put(protect, authorize('driver'), updateBid);

// Driver - Accept order bid
router.route('/orders/:orderId/accept')
  .post(protect, authorize('driver'), acceptOrderBid);

// Driver - Get and update driver orders
router.route('/orders')
  .get(protect, authorize('driver'), getDriverOrders);

router.route('/orders/:orderId/status')
  .put(protect, authorize('driver'), updateOrderStatus);

// Driver - Get and update driver profile
router.route('/profile')
  .get(protect, authorize('driver'), getDriverProfile)
  .put(protect, authorize('driver'), updateDriverProfile);

// Driver - Update availability
router.route('/availability')
  .put(protect, authorize('driver'), updateAvailability);

// Driver - Get earnings and analytics
router.route('/earnings')
  .get(protect, authorize('driver'), getEarnings);

router.route('/analytics')
  .get(protect, authorize('driver'), getAnalytics);

// Driver - Get bid history
router.route('/bids')
  .get(protect, authorize('driver'), getBidHistory);

module.exports = router;
