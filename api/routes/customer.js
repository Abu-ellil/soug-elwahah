const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getNearbyStores,
  searchProducts,
  createOrder,
  getCustomerOrders,
  getOrderDetails,
  cancelOrder,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  addReview,
  getStoreReviews,
  getDriverReviews,
  getOrderHistory
} = require('../controllers/customerController');

const router = express.Router();

// Customer - Get nearby stores
router.route('/stores/nearby')
  .get(protect, getNearbyStores);

// Customer - Search products
router.route('/products/search')
  .get(protect, searchProducts);

// Customer - Orders
router.route('/orders')
  .post(protect, createOrder)
  .get(protect, getCustomerOrders);

router.route('/orders/:id')
  .get(protect, getOrderDetails);

router.route('/orders/:id/cancel')
  .put(protect, cancelOrder);

router.route('/orders/history')
  .get(protect, getOrderHistory);

// Customer - Favorites
router.route('/favorites')
  .post(protect, addToFavorites)
  .delete(protect, removeFromFavorites)
  .get(protect, getFavorites);

// Customer - Reviews
router.route('/reviews')
  .post(protect, addReview);

router.route('/reviews/store/:storeId')
  .get(protect, getStoreReviews);

router.route('/reviews/driver/:driverId')
  .get(protect, getDriverReviews);

module.exports = router;
