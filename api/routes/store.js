const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createStore,
  getStore,
  updateStore,
  getMyStore,
  updateBusinessHours,
  updateDeliveryZones,
  getStoreProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getStoreOrders,
  updateOrderStatus,
  getStoreAnalytics,
  getStoreReviews,
  getNearbyCustomers
} = require('../controllers/storeController');

const router = express.Router();

// Store - Create store
router.route('/')
  .post(protect, authorize('store'), createStore);

// Store - Get store by ID
router.route('/:id')
  .get(protect, getStore)
  .put(protect, authorize('store'), updateStore);

// Store - Get my store
router.route('/my')
  .get(protect, authorize('store'), getMyStore);

// Store - Update business hours and delivery zones
router.route('/:storeId/business-hours')
  .put(protect, authorize('store'), updateBusinessHours);

router.route('/:storeId/delivery-zones')
  .put(protect, authorize('store'), updateDeliveryZones);

// Store - Products
router.route('/:storeId/products')
  .get(protect, getStoreProducts)
  .post(protect, authorize('store'), addProduct);

router.route('/:storeId/products/:productId')
  .put(protect, authorize('store'), updateProduct)
  .delete(protect, authorize('store'), deleteProduct);

router.route('/:storeId/products/:productId/stock')
  .put(protect, authorize('store'), updateProductStock);

// Store - Orders
router.route('/:storeId/orders')
  .get(protect, authorize('store'), getStoreOrders);

router.route('/:storeId/orders/:orderId/status')
  .put(protect, authorize('store'), updateOrderStatus);

// Store - Analytics and reviews
router.route('/:storeId/analytics')
  .get(protect, authorize('store'), getStoreAnalytics);

router.route('/:storeId/reviews')
  .get(protect, getStoreReviews);

// Store - Nearby customers
router.route('/:storeId/customers/nearby')
  .get(protect, authorize('store'), getNearbyCustomers);

module.exports = router;
